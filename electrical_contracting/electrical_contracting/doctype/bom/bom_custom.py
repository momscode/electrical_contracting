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
def on_BOM_after_submit(doc, handler=""):
    bom_item_list = frappe.db.sql("""select item_code from `tabItem Price` where item_code= %s """,(doc.item),as_dict=1)
    if not bom_item_list:
            project = frappe.new_doc('Item Price')
            project.Item_code = doc.item
            project.uom = doc.uom
            project.price_list = 'Standard Selling'
            project.price_list_rate = doc.total_bom_cost
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

            frappe.db.sql("""update `tabItem Price` set price_list_rate = %s where item_code =%s""",(doc.total_bom_cost, doc.item))
            frappe.msgprint(msg = 'Item Price Updated',
            title = 'Notification',
            indicator = 'green')
   
   
    return
        


    
    




