import frappe

def on_sales_order_after_submit(doc, handler=""):
    project = frappe.new_doc('Project')
    project.project_name = doc.name
    project.proj_name = doc.name
    project.short_description=doc.short_description
    project.project_type = 'External'
    project.customer = doc.customer
    project.sales_order = doc.name
    project.estimated_costing = doc.rounded_total

    project.flags.ignore_permissions  = True
    project.update({
        'project_name': project.project_name,
        'project_type': project.project_type,
        'customer': project.customer,
        'sales_order': project.sales_order,
        'estimated_costing': project.estimated_costing
    }).insert()
    Project_name = frappe.db.sql("""select name  from `tabProject` where sales_order= %s """,(doc.name),as_dict=1)
    for b in Project_name:

        warehouse = frappe.new_doc('Warehouse')
        warehouse.warehouse_name = b.name
        warehouse.flags.ignore_permissions  = True
        warehouse.update({
        'warehouse_name': warehouse.warehouse_name
        }).insert()

    frappe.msgprint(msg = 'Project And Warehouse Created',
       title = 'Notification',
       indicator = 'green'
    )
    return

