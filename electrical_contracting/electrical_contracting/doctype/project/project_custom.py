import frappe

from frappe.model.naming import set_name_by_naming_series

def on_project_on_submit(doc, handler=""):
    item_list = frappe.db.sql("""select si.item_code,si.item_name,si.qty
    from `tabSales Order Item` si, `tabSales Order` s
    where s.name = si.parent and si.parenttype = 'Sales Order'
    and s.docstatus = 1 and si.parent = %s""",(doc.sales_order),as_dict=1)

    """ for d in item_list:
        item = frappe.new_doc('Item')
        data = frappe.get_all("Item", fields = ["*"],filters = {'item_code' : d.item_code,'disabled':0})
        item_name = data[0]['name']
        item.item_code = doc.name +'_'+ data[0]['item_code']
        item.item_name = doc.name +'_'+data[0]['item_name']
        item.default_material_request_type = data[0]['default_material_request_type']
        item.item_group = 'Project Sellable Item'
        item.valuation_method = data[0]['valuation_method']
        item.allow_alternative_item = data[0]['allow_alternative_item']
        item.enable_deferred_revenue = data[0]['enable_deferred_revenue']
        item.enable_deferred_expense = data[0]['enable_deferred_expense']
        item.is_sales_item = 0
        item.is_purchase_item = 0
        item.is_stock_item = data[0]['is_stock_item']
        item.brand = data[0]['brand']
        item.include_item_in_manufacturing = data[0]['include_item_in_manufacturing']
        item.stock_uom = data[0]['stock_uom']
        item.description = data[0]['description']
#       item.sales_uom = data[0]['sales_uom']
        item.deferred_expense_account = data[0]['deferred_expense_account']
        item.deferred_revenue_account = data[0]['deferred_revenue_account']

        item_default_list = frappe.db.sql("""#select id.company,id.default_warehouse,id.default_price_list
            #""",id.selling_cost_center,id.income_account
           # from `tabItem Default` id, `tabItem` i
            #where i.name = id.parent and id.parenttype = 'Item'
            #and id.parent = %s"""#,(item_name),as_dict=1)"""
        
       # for i in item_default_list:
           # item.append('item_defaults', {
               # 'company': i.company,
               # 'default_warehouse': i.default_warehouse,
                #'default_price_list': i.default_price_list,
                #'selling_cost_center': i.selling_cost_center,
                #'income_account': i.income_account
            #})

        #item.flags.ignore_permissions  = True

        #"""item.update({
            #'item_name': item.item_name,
           # 'default_material_request_type': item.default_material_request_type,
            #'item_group': item.item_group,
            #'valuation_method': item.valuation_method,
            #'allow_alternative_item': item.allow_alternative_item,
           # 'enable_deferred_revenue': item.enable_deferred_revenue,
           # 'enable_deferred_expense': item.enable_deferred_expense,
            #'is_sales_item': item.is_sales_item,
            #'is_purchase_item': item.is_purchase_item,
           # 'is_stock_item': item.is_stock_item,
            #'brand': item.brand,
            #'item_code': item.item_code,
            #'include_item_in_manufacturing': item.include_item_in_manufacturing,
            #'stock_uom': item.stock_uom,
            #'description': item.description,
            #'deferred_expense_account': item.deferred_expense_account,
            #'deferred_revenue_account': item.deferred_revenue_account,
            #'item_defaults': item.item_defaults
        #}).insert()"""

    for t in item_list:
        task = frappe.new_doc('Task')
        task.subject = t.item_name
        task.project = doc.name
        task.priority = 'Low'
        task.is_group = 1
        task.planned_qty = t.qty
        task.actual_qty = t.qty
        task.flags.ignore_permissions = True
        task.update({
            'subject': task.subject,
            'project': task.project,
            'priority': task.priority,
            'is_group': task.is_group,
            'planned_qty':task.planned_qty,
            'actual_qty':task.actual_qty
        }).insert()
    
    frappe.msgprint(msg = 'Task has been created',
       title = 'Notification',
       indicator = 'green'
    )

    #frappe.msgprint(msg = 'Specific items has been created',
      # title = 'Notification',
       #indicator = 'green'
   # )

    return 

def autoname(self, method):
    set_name_by_naming_series(self)