frappe.ui.form.on('BOM', {
    validate: function(frm) {
		var total_discount_rate = 0;
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
 /*   discount_percentage: function(frm, cdt, cdn){
        var d = locals[cdt][cdn];
        msgprint('hello');
        msgprint('amount is '+ d.amount);
        frappe.model.set_value(d.doctype, d.name,"discount_rate",d.amount*(d.discount_percentage/100))
    }
*/
});
/*
frappe.ui.form.on('Project Discount Detail', {
    discount_percentage: function(frm, cdt, cdn){
        var d = locals[cdt][cdn];
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
                        var item_group = s.message.item_group;
                        if(d.item_group == item_group)
                        {
                            msgprint('Amount equal to '+v.amount);
                            frappe.model.set_value(v.doctype, v.name,"discount_percentage",d.discount_percentage)
                            frappe.model.set_value(v.doctype, v.name,"discount_rate",v.amount*(v.discount_percentage/100))
                        }
                    }
                }
            })

        });
    }

});
*/