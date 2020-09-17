frappe.ui.form.on('Material Request', {
    validate:function(frm,cdt,cdn)
    {
        var d =locals[cdt][cdn];
        $.each(frm.doc.items || [], function(i, s) {
             var amount = flt(s.rate);
             var bom_rate=s.rate_with_discount;
            //frm.set_value("stock_material_cost",material_cost);
            if(amount>bom_rate)
            {
                var val =i+1;
                frappe.msgprint(__(`Item price is greater than BOM rate - Row `+val));
                frappe.validated = false;
              
                return false; 
                frappe.validated = false;
            }
            frappe.validated = false;
        });
    },
    refresh:function(frm,cdt,cdn){
        var d =locals[cdt][cdn];
        if(frm.doc.project)
        {
            frm.set_query("task", function() {
                return {
                    filters: [
                        ["Task","project", "=", frm.doc.project]
                    ]
                }
            });
            frm.refresh_field("task");
        }
        if(frm.doc.bom)
        {
        frappe.call({
            method: 'electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_generic_bom_activities',
            args: { 
                'g_bom':d.bom                
            },
            callback: function(r) {
                if(!r.exc){
                   
                    var df = frappe.meta.get_docfield("Material Request","activity_type", cur_frm.doc.name);
                    var q_options = [];
                    for (var i=0; i<r.message.length; i++){
                        var a = r.message[i].activity_type;
                        q_options.push(a)
                    }
                df.options = q_options;
                frm.refresh_field("activity_type");
                }
            }
        })
    }
    frm.refresh_field("activity_type");
    },
    task:function(frm){
        if(frm.doc.task && frm.doc.project)
        {
            //get subject of task
            frappe.call({
                method: 'frappe.client.get_value',
                args: {
                    'doctype': 'Task',
                    'filters': {
                        'name':frm.doc.task
                    },
                    'fieldname': [
                        'subject','parent_task','actual_qty'
                    ]                   
                },
                callback: function(r){
                    frm.set_value("qty",r.message.actual_qty);
                    if(!r.exc){
                        if(r.message.parent_task)
                        {
                            frappe.call({
                                 method: 'frappe.client.get_value',
                                 args: {
                                            'doctype': 'Task',
                                            'filters': {
                                                'name':r.message.parent_task
                                        },
                                        'fieldname': [
                                            'subject'
                                        ]                   
                },
                callback: function(r){
                    frappe.call({
                        method: 'frappe.client.get_value',
                        args: {
                            'doctype': 'BOM',
                            'filters': {
                                'project': frm.doc.project,
                                'is_active': 1,
                                'is_default':1,
                                'type': 'Project',
                                'g_item':r.message.subject
                            },
                            'fieldname': [
                                'name'
                            ]                   
                        },
                        callback: function(n){
                            if(!n.exc){
                                if(n.message.name){
                                    frm.set_value("bom",n.message.name);
                                    frappe.call({
                                        method: 'electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_generic_bom_activities',
                                        args: { 
                                            'g_bom': n.message.name                
                                        },
                                        callback: function(r) {
                                           
                                            if(!r.exc){
                                                var df = frappe.meta.get_docfield("Material Request","activity_type", cur_frm.doc.name);
                                                var q_options = [];
                                                for (var i=0; i<r.message.length; i++){
                                                    var a = r.message[i].activity_type;
                                                    q_options.push(a)
                                                }
                                            df.options = q_options;
                                            frm.refresh_field("activity_type");
                                            }
                                        }
                                    })
                                  

                                }
                            }
                        }
                    })
                }
                            });  
                        }
                        else{
                            alert("parent task");
                        //set bom corresponding to task and project 
                        frappe.call({
                            method: 'frappe.client.get_value',
                            args: {
                                'doctype': 'BOM',
                                'filters': {
                                    'project': frm.doc.project,
                                    'is_active': 1,
                                    'is_default':1,
                                    'type': 'Project',
                                    'g_item':r.message.subject
                                },
                                'fieldname': [
                                    'name'
                                ]                   
                            },
                            callback: function(n){
                                if(!n.exc){
                                    if(n.message.name){
                                        frm.set_value("bom",n.message.name);
                                        frappe.call({
                                            method: 'electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_generic_bom_activities',
                                            args: { 
                                                'g_bom': n.message.name                
                                            },
                                            callback: function(r) {
                                               
                                                if(!r.exc){
                                                    var df = frappe.meta.get_docfield("Material Request","activity_type", cur_frm.doc.name);
                                                    var q_options = [];
                                                    for (var i=0; i<r.message.length; i++){
                                                        var a = r.message[i].activity_type;
                                                        q_options.push(a)
                                                    }
                                                df.options = q_options;
                                                frm.refresh_field("activity_type");
                                                }
                                            }
                                        })
                                      

                                    }
                                }
                            }
                        })

                    }
                }
                }
            })
           
        }
    },
    get_items:function(frm,cdt,cdn){
        var d =locals[cdt][cdn];
       var activity_type=d.activity_type;
       var project=d.project;
       var qty=d.qty;
        frappe.call({
            method: "electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_bom_items",
            args:{
                'g_bom': frm.doc.bom,
                'activity_type':activity_type
            },
            callback:function(r){
                if(!r.exc){
                    frm.clear_table("items");
                    frm.refresh_field("items");
                    for (var i=0; i<r.message.length; i++){
                        var d = frm.add_child("items");
                        var item = r.message[i];
                        alert(item.rate);
                        var quantity=item.qty*qty;
                        frappe.model.set_value(d.doctype, d.name, "item_code", item.item_code);
                        frappe.model.set_value(d.doctype, d.name, "qty", (item.qty*qty));
                        frappe.model.set_value(d.doctype, d.name, "uom", item.uom);
                        frappe.model.set_value(d.doctype, d.name, "warehouse",project+' - AMS');
                        frappe.model.set_value(d.doctype, d.name, "discount",item.discount_percentage);
                        frappe.model.set_value(d.doctype, d.name, "bom_rate",item.amount);
                        frappe.model.set_value(d.doctype, d.name, "rate_bom",item.rate);
                        frm.refresh_field("items");
                    }
                    


                }
            }
        })
    } 
});
frappe.ui.form.on('Material Request Item', { 
    
    item_code:function(frm,cdt,cdn)
    {
        var d =locals[cdt][cdn];
        var c =(d.rate_bom)*(d.discount/100);
        frappe.model.set_value(d.doctype, d.name, "discount_rate",c);
        frappe.model.set_value(d.doctype, d.name, "rate_with_discount",d.rate_bom-c);
    }
});