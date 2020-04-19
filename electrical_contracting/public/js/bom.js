frappe.ui.form.on('BOM', {
    setup: function(frm) {
		frm.set_query("g_bom", function() {
			return {
				filters: [
					["BOM","type", "=", "General"]
				]
			}
        });
        if(!cur_frm.doc.__islocal)
        {
            var type = frappe.meta.get_docfield("BOM","type", cur_frm.doc.name);
            var project_name = frappe.meta.get_docfield("BOM","project_name", cur_frm.doc.name);
            var g_item = frappe.meta.get_docfield("BOM","g_item", cur_frm.doc.name);
            type.read_only = 1;
            project_name.read_only = 1;
            g_item.read_only = 1;
            frm.refresh_field("type");
            frm.refresh_field("project_name");
            frm.refresh_field("g_item");
        }
        else{
            var type = frappe.meta.get_docfield("BOM","type", cur_frm.doc.name);
            var project_name = frappe.meta.get_docfield("BOM","project_name", cur_frm.doc.name);
            var g_item = frappe.meta.get_docfield("BOM","g_item", cur_frm.doc.name);
            type.read_only = 0;
            project_name.read_only = 0;
            g_item.read_only = 0;
            frm.refresh_field("type");
            frm.refresh_field("project_name");
            frm.refresh_field("g_item");
        }
    },
    onload: function(frm,cdt,cdn){
           /* var qty = frappe.meta.get_docfield("BOM Item","qty", cur_frm.doc.name);
            var uom = frappe.meta.get_docfield("BOM Item","uom", cur_frm.doc.name);
            var rate = frappe.meta.get_docfield("BOM Item","rate", cur_frm.doc.name);
            var amount = frappe.meta.get_docfield("BOM Item","amount", cur_frm.doc.name);
            var g_item_code = frappe.meta.get_docfield("BOM Item","g_item_code", cur_frm.doc.name);
            qty.in_list_view = 0;
            uom.in_list_view = 0;
            rate.in_list_view = 0;
            amount.in_list_view = 0;
            g_item_code.in_list_view = 1;
            frm.refresh_field("items");*/
            
    },
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
    type: function(frm,cdt,cdn){
        frm.refresh_field("items");
        if(frm.doc.type == 'General'){
            if(frm.doc.project && frm.doc.docstatus != 0)
            {
                frm.set_value("project",null);
                frm.set_value("project_name",null);
                frm.set_value("g_bom",null);
                frm.set_value("g_item",null);
                frm.set_value("item",null);
                frm.clear_table("items");
                frm.clear_table("bom_discount_detial");
                frm.refresh_field("items");
                frm.refresh_field("bom_discount_detial");
            }
        }
        if(frm.doc.type == 'Project'){
            /*msgprint('hello');
            var qty = frappe.meta.get_docfield("BOM Item","qty", cur_frm.doc.name);
            var uom = frappe.meta.get_docfield("BOM Item","uom", cur_frm.doc.name);
            var rate = frappe.meta.get_docfield("BOM Item","rate", cur_frm.doc.name);
            var amount = frappe.meta.get_docfield("BOM Item","amount", cur_frm.doc.name);
            var g_item_code = frappe.meta.get_docfield("BOM Item","g_item_code", cur_frm.doc.name);
            qty.in_list_view = 0;
            uom.in_list_view = 0;
            rate.in_list_view = 0;
            amount.in_list_view = 0;
            g_item_code.in_list_view = 1;
            frm.refresh_field("items");*/
        }
    },
    project_name: function(frm){
        if(frm.doc.project_name){
            frm.set_value("project",frm.doc.project_name);
        }
    },
    g_bom: function(frm){
        if(frm.doc.g_bom){
            frappe.call({
                method: "electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_generic_details",
                args:{
                    'g_bom': frm.doc.g_bom
                },
                callback:function(r){
                    if(!r.exc){
                        frm.clear_table("items");
                        frm.refresh_field("items");
                        for (var i=0; i<r.message.length; i++){
                            var d = frm.add_child("items");
                            var item = r.message[i];
                            if(item.item_group == 'Services')
                            {
                                d.item_code = item.item_code;
                            }
                            d.g_item_code = item.item_code;
                            //d.g_activity_type = item.activity_type;
                            d.activity_type = item.activity_type;
                            //d.g_qty = item.qty;
                            //d.g_uom = item.uom;
                            d.qty = item.qty;
                            d.uom = item.uom;
                            //d.g_rate = item.rate;
                            //d.g_amount = item.amount
                            frm.refresh_field("items");
                        }
                    }
                }
            })
        }
    },
    g_item: function(frm){
        if(frm.doc.project){
            frm.set_value("item",frm.doc.project+'_'+frm.doc.g_item);
            frappe.call({
                method: 'frappe.client.get_value',
                args:{
                    'doctype':'BOM',
                    'filters':{
                        'item': frm.doc.g_item,
                        'docstatus': 1,
                        'is_default': 1
                    },
                    'fieldname':['name']
                },
                callback:function(r){
                    if (!r.exc) {
                        var a = r.message.name;
                        frm.set_value("g_bom",r.message.name);
                    }
                }
            });
        }
    },
    project: function(frm){          
        if(frm.doc.project){
            cur_frm.set_query("g_item", function() {
                return {
                    "query": "electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_sales_order_items",
                    "filters":{
                        "project":frm.doc.project
                    }
                };
            });
            $.each(frm.doc.bom_discount_detial || [], function(i, d) {
                frappe.model.set_value(d.doctype, d.name,"project",frm.doc.project)
            });
        }
    }
})
frappe.ui.form.on('BOM Item', {
    activity_type: function(frm, cdt, cdn){
       // if(frm.doc.type == 'Project'){
            var d = locals[cdt][cdn];
            var flag = false;
            var item = d.activity_type;      
            $.each(frm.doc.items || [], function(i, v) {
                if(v.item_code == item){
                    flag = true;
                }
            }); 
            if(flag != true){
                var bom_item = frm.add_child("items");
                frappe.model.set_value(bom_item.doctype, bom_item.name, "item_code", item);
                cur_frm.refresh_field("items");
            }  
        //}   
    },  
    item_code: function(frm, cdt, cdn){
        if(frm.doc.type == 'Project'){
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
                    if(flag != true && item_group != 'Services')
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
    }
});