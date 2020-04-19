import frappe

def on_sales_order_after_submit(doc, handler=""):
    project = frappe.new_doc('Project')
    project.project_name = doc.name
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

    frappe.msgprint(msg = 'A Project has been created',
       title = 'Notification',
       indicator = 'green'
    )

    return

