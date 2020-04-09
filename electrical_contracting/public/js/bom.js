frappe.ui.form.on('BOM', {
    before_submit: function(frm){
        if(!frm.doc.project_discount && frm.doc.docstatus == '0'){
            //set product discount name 
            frappe.call({
                method: 'frappe.client.get_value',
                args: {
                    'doctype': 'Project Discount',
                    'filters': {
                        'project': frm.doc.project,
                        'is_active': 1
                    },
                    'fieldname': [
                        'name'
                    ]                   
                },
                callback: function(n){
                    if(!n.exc){
                        frm.set_value("project_discount",n.message.name);
                    }
                }
            })
            }
    },
    validate: function(frm) {
        var total_discount_rate = 0;
        if(frm.doc.project != '')
        {
            $.each(frm.doc.bom_discount_detial || [], function(i, d) {
                $.each(frm.doc.items || [], function(i, v) {
                    frappe.call({
                        method: 'frappe.client.get_value',
                        args: {
                            'doctype': 'Item',
                            'filters': {'name': v.item_code},
                            'fieldname': [
                                'item_group'
                            ]
                        },
                        callback: function(s) {
                            if (!s.exc) {
                                if(d.item_group == s.message.item_group){
                                    var discount_rate = 0;
                                    discount_rate = flt(v.amount)*(flt(d.discount_percentage)/100)
                                    total_discount_rate += flt(discount_rate);
                                    frm.set_value("total_discount",total_discount_rate);
                                    frappe.model.set_value(v.doctype, v.name,"discount_percentage",d.discount_percentage)
                                    frappe.model.set_value(v.doctype, v.name,"discount_rate",discount_rate)
                                }
                        }
                    }
                    })
                });
            });
        }
        else
        {
            if(frm.doc.type == 'Project')
            {
                msgprint('Please Select the Project');
                validated = false;
            }           
        }
    },
    project: function(frm){
        $.each(frm.doc.bom_discount_detial || [], function(i, d) {
            frappe.model.set_value(d.doctype, d.name,"project",frm.doc.project)
        });
    }
})
frappe.ui.form.on('BOM Item', {
    item_code: function(frm, cdt, cdn){
        var d = locals[cdt][cdn];
        var item = d.item_code;
        var item_group = '';
   //-------to get item group of selected item----------
        frappe.call({
            method: 'frappe.client.get_value',
            args: {
                    'doctype': 'Item',
                    'filters': {'name': item},
                    'fieldname': [
                         'item_group',
                         'stock_uom'
                     ]
     },
     callback: function(s) {
                if (!s.exc) {
                    var flag = false;
                    item_group = s.message.item_group;
                    $.each(frm.doc.bom_discount_detial || [], function(i, v) {
                        if(v.item_group == item_group)
                        {
                            flag = true;
                        }
                    });
                    if(flag != true)
                    {
                        frappe.call({
                            method: 'frappe.client.get_value',
                            args: {
                                'parent': 'Project Discount',
                                'doctype': 'Project Discount Detail',
                                'filters': {'parentfield': 'discount_detail','item_group': item_group,'project': frm.doc.project},
                                'fieldname': [
                                     'item_group',
                                     'discount_percentage'
                                 ]
                        },
                        callback : function(r) {
                            // add item group into table 'bom discount detail'
                            if(!r.exc)
                            {
                                if(r.message){
                                    d = frm.add_child("bom_discount_detial");
                                    d.item_group = r.message.item_group;
                                    d.project = frm.doc.project;
                                    d.discount_percentage = r.message.discount_percentage;
                                    cur_frm.refresh_field("bom_discount_detial");
                                }
                                else{
                                    d = frm.add_child("bom_discount_detial");
                                    d.item_group = item_group;
                                    d.project = frm.doc.project;
                                    cur_frm.refresh_field("bom_discount_detial");
                                }
                            }
                        }
                        })
                    }
                    
                }
             }
        })       
    }
});