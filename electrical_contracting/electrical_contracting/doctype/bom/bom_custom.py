import frappe

@frappe.whitelist()
def get_sales_order_items(doctype, txt, searchfield, start, page_len, filters):
    return frappe.db.sql("""select si.item_code
    from `tabSales Order Item` si, `tabSales Order` s
    where s.name = si.parent and si.parenttype = 'Sales Order'
    and s.docstatus = 1 and 
    si.item_code not in(select g_item from `tabBOM` where type = 'Project' and g_item = si.item_code and docstatus<2)
    and si.parent = (select name from `tabSales Order` where project = %s and docstatus = 1)""",(filters.get('project')))


@frappe.whitelist()
def get_generic_details(g_bom):
    bom_item_list = frappe.db.sql("""select bi.item_code,i.item_group,bi.activity_type,bi.qty,bi.uom,bi.rate,bi.amount 
    from `tabBOM Item` bi, `tabBOM` b, `tabItem` i
    where b.name = bi.parent and bi.parenttype = 'BOM'
    and bi.item_code = i.item_code and i.disabled = 0
    and bi.docstatus = 1 and bi.parent = %s order by bi.idx asc""",(g_bom),as_dict=1)

    return bom_item_list

#@frappe.whitelist()
#def get_generic_bom_activities(g_bom):
#    bom_activity_list = frappe.db.sql("""select ba.activity_type,ba.hour_rate,ba.uom,ba.qty,
#    ba.per_minutes_rate,ba.minutes,ba.per_hour_rate,ba.hour,ba.per_day_rate,ba.days,ba.base_activity_cost  
#    from `tabBOM Activities` ba, `tabBOM` b
#    where b.name = ba.parent and ba.parenttype = 'BOM'
#    and ba.docstatus = 1 and ba.parent = %s order by ba.idx asc """,(g_bom),as_dict=1)

#    return bom_activity_list

@frappe.whitelist()
def get_generic_bom_activities(g_bom):
    bom_activity_list = frappe.db.sql("""select ba.activity_type,ba.uom,ba.qty,
    ba.rate,ba.base_activity_cost  
    from `tabBOM Activities` ba, `tabBOM` b
    where b.name = ba.parent and ba.parenttype = 'BOM'
    and ba.docstatus = 1 and ba.parent = %s order by ba.idx asc """,(g_bom),as_dict=1)

    return bom_activity_list
@frappe.whitelist()
def get_bom_items(g_bom,activity_type):
    bom_activity_list = frappe.db.sql("""select ba.item_code,ba.activity_type,ba.uom,ba.qty,ba.discount_percentage,ba.discount_rate,ba.rate,ba.amount,
    ba.stock_uom 
    from `tabBOM Item` ba, `tabBOM` b
    where b.name = ba.parent and ba.parenttype ='BOM'
    and ba.docstatus = 1 and ba.parent = %s  and ba.activity_type= %s order by ba.idx asc """,(g_bom,activity_type),as_dict=1)

    return bom_activity_list

def on_BOM_after_submit(doc, handler=""):
    
    if(doc.service_only_bom==1):
        bom_item_list = frappe.db.sql("""select item_code from `tabItem Price` where item_code= %s """,(doc.item),as_dict=1)
        if not bom_item_list:
            project = frappe.new_doc('Item Price')
            project.Item_code = doc.item
            project.uom = doc.uom
            project.price_list = 'Standard Selling'
            project.quantity=doc.quantity
            project.price_list_rate = doc.activity_material_cost/doc.quantity
            project.flags.ignore_permissions  = True
            project.update({
                'item_code': project.Item_code,
                'uom': project.uom,
                'price_list': project.price_list,
                'price_list_rate': project.price_list_rate
            }).insert()
            frappe.msgprint(msg = 'Item Price Created',
            title = 'Notification',
            indicator = 'green')
        else:
            frappe.db.sql("""update `tabItem Price` set price_list_rate = %s where item_code =%s""",((doc.activity_material_cost/doc.quantity), doc.item))
            frappe.msgprint(msg = 'Item Price Updated',
            title = 'Notification',
            indicator = 'green')
    else:
        bom_item_list = frappe.db.sql("""select item_code from `tabItem Price` where item_code= %s """,(doc.item),as_dict=1)
        if not bom_item_list:
            project = frappe.new_doc('Item Price')
            project.Item_code = doc.item
            project.uom = doc.uom
            project.price_list = 'Standard Selling'
            project.quantity=doc.quantity
            project.price_list_rate = doc.total_bom_cost/doc.quantity
            project.flags.ignore_permissions  = True
            project.update({
            'item_code': project.Item_code,
            'uom': project.uom,
            'price_list': project.price_list,
            'price_list_rate': project.price_list_rate
            }).insert()
            frappe.msgprint(msg = 'Item Price Created',
            title = 'Notification',
            indicator = 'green')
        else:
        
            frappe.db.sql("""update `tabItem Price` set price_list_rate = %s where item_code =%s""",((doc.total_bom_cost/doc.quantity), doc.item))
            frappe.msgprint(msg = 'Item Price Updated',
            title = 'Notification',
            indicator = 'green')
            if doc.opportunity:
                name = frappe.db.get_value('Project Discount', {'opportunity': doc.opportunity,'is_active':1},'name')
                if name:
                    for i in doc.bom_discount_detial:
                        target_doc = frappe.get_doc('Project Discount', name)
                        item_group = frappe.db.get_value('Project Discount Detail', {'opportunity': i.opportunity,'parent': name,'item_group': i.item_group}, 'item_group')
                        if item_group:
                            frappe.db.sql("""update `tabProject Discount Detail` set discount_percentage = %s where item_group =%s""",((i.discount_percentage), i.item_group))
                        else:
                            if not item_group:
                                target_doc.append('discount_detail', {
                                    'item_group': i.item_group,
                                    'opportunity': i.opportunity,
                                    'discount_percentage': i.discount_percentage,
                                })
                        target_doc.save()
                        frappe.db.commit()
        return target_doc
   
    return

@frappe.whitelist()
def get_Activity_details(activity_type):
    activity_list = frappe.db.sql("""select  rate,uom from `tabActivity Item Details` where parent=%s """,(activity_type),as_dict=1)

    return activity_list

@frappe.whitelist()
def get_sellable_item_group():
    item_group_list = frappe.db.sql("""select item_group_name from `tabItem Group` where parent_item_group = 'Generic Sellable Item' """,as_dict=1)
    return item_group_list

@frappe.whitelist()
def get_uom_details(activity_type):
    uom_list = frappe.db.sql("""select  distinct uom from `tabActivity Item Details`  """,as_dict=1)

    return uom_list

        


    
    




