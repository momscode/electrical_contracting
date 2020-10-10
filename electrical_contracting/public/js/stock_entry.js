frappe.ui.form.on('Stock Entry', {
refresh:function(frm)
    {
        
        frm.add_custom_button(__('Material Request'), function() {
            erpnext.utils.map_current_doc({
                method: "erpnext.stock.doctype.material_request.material_request.make_stock_entry",
                source_doctype: "Material Request",
                target: frm,
                date_field: "schedule_date",
                setters: {
                    company: frm.doc.company,
                    project:frm.doc.project
                },
                get_query_filters: {
                    docstatus: 1,
                    project:frm.doc.project
                    //material_request_type: "Material Transfer",
                    //status: ['!=', 'Transferred']
                }
            })
        }, __("Get items from"));
    },
});