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
    validate: function(frm,cdt,cdn) {
        var d =locals[cdt][cdn];
        var total_discount_rate = 0;
        var total_cost_with_discount = 0;
        var material_cost = 0;
        var activity_cost = 0;
        var total_cost =0;      
        $.each(frm.doc.items || [], function(i, s) {
            material_cost += flt(s.amount);
            frm.set_value("stock_material_cost",material_cost); 
        });
        $.each(frm.doc.activities || [], function(i, s) {
            activity_cost += flt(s.base_activity_cost);
            frm.set_value("activity_material_cost",activity_cost);
        });
        if(frm.doc.type == 'General'){
            total_cost = d.activity_material_cost+d.stock_material_cost;
            frm.set_value("total_bom_cost",total_cost);
        }
        else{
            if(!frm.doc.total_bom_cost){
                msgprint('Please apply discount');
                frappe.validated = false;
            }
        }
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
        $.each(frm.doc.activities || [], function(i, s) {
            activity_cost += flt(s.base_activity_cost);
            
            frm.set_value("specific_activity_cost",activity_cost);
                            
        });
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
                            total_cost_with_discount += (flt(v.amount) - flt(discount_rate));
                           // frm.set_value("specific_total_cost",total_cost_with_discount);
                            frm.set_value("total_cost_with_discount",total_cost_with_discount);

                       }
                    }
                })
            });
        });
    },
    specific_total_cost: function(frm){
        frm.set_value("total_bom_cost",frm.doc.specific_total_cost);
    },
    total_cost_with_discount: function(frm){
        frm.set_value("specific_total_cost",flt(frm.doc.total_cost_with_discount) + flt(frm.doc.specific_activity_cost));
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
            //fetch BOM Activities
            frappe.call({
                method: "electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_generic_bom_activities",
                args:{
                    'g_bom': frm.doc.g_bom
                },
                callback:function(r){
                    if(!r.exc){
                        frm.clear_table("activities");
                        frm.refresh_field("activities");
                        for (var i=0; i<r.message.length; i++){
                            var d = frm.add_child("activities");
                            var item = r.message[i];
                            //d.activity_type = item.activity_type;
                            frappe.model.set_value(d.doctype, d.name, "activity_type", item.activity_type);
                            d.description = item.description;
                            d.hour_rate = item.hour_rate;
                            d.uom = item.uom;
                            d.per_minutes_rate = item.per_minutes_rate;
                            d.minutes = item.minutes;
                            d.per_hour_rate = item.per_hour_rate;
                            d.hour = item.hour;
                            d.per_day_rate = item.per_day_rate;
                            d.days = item.days;
                            d.base_activity_cost = item.base_activity_cost;
                            /*frappe.model.set_value(d.doctype, d.name, "activity_type", item.activity_type);
                            frappe.model.set_value(d.doctype, d.name, "description", item.description);
                            frappe.model.set_value(d.doctype, d.name, "hour_rate", item.hour_rate);
                            frappe.model.set_value(d.doctype, d.name, "uom", item.uom);
                            frappe.model.set_value(d.doctype, d.name, "per_minutes_rate", item.per_minutes_rate);
                            frappe.model.set_value(d.doctype, d.name, "minutes", item.minutes);
                            frappe.model.set_value(d.doctype, d.name, "per_hour_rate", item.per_hour_rate);
                            frappe.model.set_value(d.doctype, d.name, "hour", item.hour);
                            frappe.model.set_value(d.doctype, d.name, "per_day_rate", item.per_day_rate);
                            frappe.model.set_value(d.doctype, d.name, "days", item.days);
                            frappe.model.set_value(d.doctype, d.name, "base_activity_cost", item.base_activity_cost);*/                    
                            frm.refresh_field("activities");
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
                        'total_bom_cost',
                        'stock_material_cost',
                        'activity_material_cost'
                    ]
                },
                callback:function(s){
                    if (!s.exc) {
                        frm.set_value("generic_material_cost",s.message.stock_material_cost);
                        frm.set_value("generic_activity_cost",s.message.activity_material_cost);
                        frm.set_value("generic_total_cost",s.message.total_bom_cost);
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

    amount: function(frm, cdt, cdn)
    {
    },
    item_code: function(frm, cdt, cdn){
        var d = locals[cdt][cdn];
        var df = frappe.meta.get_docfield("BOM Item","activity_type", cur_frm.doc.name);
        var q_options = []; 
        $.each(frm.doc.activities || [], function(i, v) {
            q_options.push(v.activity_type)
        });
        df.options = q_options;
       /* var d = locals[cdt][cdn];
        var count =0;
        $.each(frm.doc.items || [], function(i, v) {
            if(d.item_code == v.item_code)
            { 
               count++;
            }
        });
        if(count>1)
        {
            frappe.msgprint(__("Item Already Exist"));
            frappe.model.set_value(d.doctype, d.name,"item_code",'')
        }*/
        if(frm.doc.type == 'Project'){
            var item_group = '';
   //-------to get item group of selected item----------
            frappe.call({
                method: 'frappe.client.get_value',
                args: {
                        'doctype': 'Item',
                        'filters': {'name': d.item_code},
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
frappe.ui.form.on('BOM Activities', {

 uom:function(frm,cdt,cdn)
 {
    var d = locals[cdt][cdn];
    var activity_type = d.activity_type;
      
    frappe.call({
        method: 'frappe.client.get_value',
        args: {
                'doctype': 'Activity Item',
                'filters': {'activity_type': activity_type },
                'fieldname': [
                    'per_minute_rate',
                    'per_hour_rate',
                    'per_day_rate'
                ]
    },
    callback: function(s) {
        

        if(d.uom == 'Mins')
        {
           
            frappe.model.set_value(d.doctype, d.name,"per_minutes_rate",s.message.per_minute_rate)
        }
        else if(d.uom=='Hr')
        {
            frappe.model.set_value(d.doctype, d.name,"per_hour_rate",s.message.per_hour_rate)
        }
        else
        {
            frappe.model.set_value(d.doctype, d.name,"per_day_rate",s.message.per_day_rate)  
        }
    }
});
 },


    activity_type:function(frm,cdt,cdn){
        var d = locals[cdt][cdn];
        var count =0;
        $.each(frm.doc.activities || [], function(i, v) {
            if(d.activity_type == v.activity_type)
            {
               count++;
              
            }
        });
        if(count>1)
        {
            frappe.msgprint(__("Activity Type Already Exist"));
            frappe.model.set_value(d.doctype, d.name,"activity_type",'')
        }

    },
    minutes:function(frm,cdt,cdn)
    {
        var d = locals[cdt][cdn];
        var _mins = d.per_minutes_rate * d.minutes;
        frappe.model.set_value(d.doctype, d.name,"base_activity_cost",_mins)
    },
    hour:function(frm,cdt,cdn)
    {
        var d = locals[cdt][cdn];
        var _mins = d.per_hour_rate * d.hour;
        frappe.model.set_value(d.doctype, d.name,"base_activity_cost",_mins)
    },
    days:function(frm,cdt,cdn)
    {
        var d = locals[cdt][cdn];
        var _mins = d.per_day_rate * d.days;
        frappe.model.set_value(d.doctype, d.name,"base_activity_cost",_mins)
    }
   
   
});
