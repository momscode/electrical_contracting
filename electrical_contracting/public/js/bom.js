frappe.ui.form.on('BOM', {
    
    setup: function(frm) {
        //-------statements---------
    },
    refresh: function(frm){
        if(frm.doc.type == 'General'){
            frm.set_df_property("g_item", "reqd", 0);
            frm.set_query("item", function() {
                return {
                    filters: [
                        ["Item","item_group", "=", "Generic Sellable Items"]
                    ]
                }
            });
            frm.fields_dict['items'].grid.get_field('item_code').get_query = function(doc, cdt, cdn) {
                var child = locals[cdt][cdn];
                return {    
                    filters:[
                        ['item_group', 'in', ['Generic Items']]
                    ]
                }
            }
            frm.refresh_field("items");
        }
        else{
            frm.set_df_property("g_item", "reqd", 1);
            frm.set_query("item", function() {
                return {
                    filters: [
                        ["Item","item_group", "=", "Project Sellable Items"]
                    ]
                }
            });
            frm.fields_dict['items'].grid.get_field('item_code').get_query = function(doc, cdt, cdn) {
                var child = locals[cdt][cdn];
                //console.log(child);
                return {    
                    filters:[
                        ['item_group', '!=', 'Generic Items']
                    ]
                }
            }
            frm.refresh_field("items");
        }
    },
    onload: function(frm,cdt,cdn){
        if(!cur_frm.doc.__islocal)
        {
            var g_item = frappe.meta.get_docfield("BOM","g_item", cur_frm.doc.name);
            g_item.read_only = 1;
            frm.refresh_field("g_item");
        }
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
        var total_cost_with_discount = 0;
        var material_cost = 0;
        //declare variable to calculate tota activity cost
        //var activity_cost = 0;      
        //calculate cost(material) and cost(activity)
        $.each(frm.doc.items || [], function(i, s) {
            material_cost += flt(s.amount);
            //calculate total activity cost from activity table
            frm.set_value("stock_material_cost",material_cost);
            //set total activity cost 'acivity_material_cost'
        });
        //check rate difference between generic and project specific bom
        if(frm.doc.type == 'Project'){
            if(frm.doc.specific_total_cost > frm.doc.generic_total_cost){
                return new Promise(function(resolve, reject){
                    frappe.confirm(
                        'BOM Cost exceeds generic BOM Cost. Proceed?',
                        function(){
                            resolve();
                        },
                        function(){
                            reject();
                        }
                    )
                })
            }
        }              
    },
    btn_discount: function(frm){
        var total_discount_rate = 0;
        var total_cost_with_discount = 0;
        var material_cost = 0;
        var activity_cost = 0;
        //calculate cost(material) and cost(activity)
        $.each(frm.doc.items || [], function(i, s) {
            material_cost += flt(s.amount);
            frm.set_value("specific_material_cost",material_cost);
                            
        });
        //calculate cost(activity) from activity table
        //----hint---
        //activity_cost += flt(s.amount);
        //frm.set_value("specific_activity_cost",activity_cost);
        //--------------------
        //set discount % and rate in bom item table
        $.each(frm.doc.bom_discount_detial || [], function(i, d) {
            total_cost_with_discount = 0;
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
                            var discount_rate = 0;
                            if(d.item_group == s.message.item_group){
                                discount_rate = flt(v.amount)*(flt(d.discount_percentage)/100);
                                total_discount_rate += flt(discount_rate);
                                frm.set_value("total_discount",total_discount_rate);
                                frappe.model.set_value(v.doctype, v.name,"discount_percentage",d.discount_percentage)
                                frappe.model.set_value(v.doctype, v.name,"discount_rate",discount_rate)
                            }
                            //calculate total cost with margin
                            total_cost_with_discount += (flt(v.amount)+flt(discount_rate));
                            frm.set_value("specific_total_cost",total_cost_with_discount);
                            frm.set_value("total_cost_with_discount",total_cost_with_discount);

                       }
                    }
                })
            });
        });
    },
    type: function(frm){
        if(frm.doc.type == 'General'){
            frm.set_value("project",null);
            frm.set_value("project_name",null);
            frm.set_value("g_bom",null);
            frm.set_value("g_item",null);
            frm.set_value("item",null);
            frm.clear_table("items");
            frm.clear_table("bom_discount_detial");
            frm.refresh_field("project");
            frm.refresh_field("g_bom");
            frm.refresh_field("project_name");
            frm.refresh_field("g_item");
            frm.refresh_field("item");
            frm.refresh_field("items");
            frm.refresh_field("bom_discount_detial");
        }
        if(frm.doc.type == 'Project'){
            frm.set_value("item",null);
            frm.clear_table("items");
            frm.refresh_field("item");
        }
        frm.refresh();
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
                            frappe.model.set_value(d.doctype, d.name, "g_item_code", item.item_code);
                            frappe.model.set_value(d.doctype, d.name, "activity_type", item.activity_type);
                            frappe.model.set_value(d.doctype, d.name, "qty", item.qty);
                            frappe.model.set_value(d.doctype, d.name, "uom", item.uom);
                            frm.refresh_field("items");
                        }
                    }
                }
            })
            //fetch material cost,actvity cost,total cost of generic bom
            frappe.call({
                method: 'frappe.client.get_value',
                args:{
                    'doctype':'BOM',
                    'filters':{
                        'name': frm.doc.g_bom
                    },
                    'fieldname':[
                        'total_cost',
                        'stock_material_cost',
                        'activity_material_cost'
                    ]
                },
                callback:function(s){
                    if (!s.exc) {
                        frm.set_value("generic_material_cost",s.message.stock_material_cost);
                        frm.set_value("generic_activity_cost",s.message.activity_material_cost);
                        frm.set_value("generic_total_cost",s.message.total_cost);
                        frm.refresh_field("generic_material_cost");
                        frm.refresh_field("generic_activity_cost");
                        frm.refresh_field("generic_total_cost");
                    }
                }
            });
        }
    },
    g_item: function(frm){
        if(frm.doc.project && frm.doc.g_item){
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
        //--statements----  
    },
    amount: function(frm, cdt, cdn){
        //------statements-----
    },
    item_code: function(frm, cdt, cdn){
        var d = locals[cdt][cdn];
        var item = d.item_code;
        //check an Item already added in table or not      
       /* $.each(frm.doc.items || [], function(i, v) {
            if(v.item_code == item){
                msgprint('item already selected in table');
                frappe.model.set_value(v.doctype, v.name, "item_code", null);
            }
        }); */
        if(frm.doc.type == 'Project'){
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
    }
});