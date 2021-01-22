frappe.ui.form.on('BOM', {
    
    setup: function(frm) {
        //-------statements---------
    },
   
    refresh:function(frm, cdt, cdn){

        if(frm.doc.type == 'General'){ 
        var d = locals[cdt][cdn];
        var d = locals[cdt][cdn];
        var df = frappe.meta.get_docfield("BOM Item","activity_type", cur_frm.doc.name);
        var q_options = []; 
        $.each(frm.doc.activities || [], function(i, v) {
            q_options.push(v.activity_type)
        });
        df.options = q_options;
            //get all item group whosw parent group is 'AMSECC Sellable Item'
            var item = [];
            frappe.call({
                method:"electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_sellable_item_group",
                args:{
                },
                callback: function(s) {
                    if(!s.exc){
                        console.log(s.message);                        
                        for (var i=0; i<=s.message.length; i++){
                            item.push(s.message[i].item_group_name);
                        }
                    }
                    
                }
            });
            frm.set_query("item", function() {
                return {
                    filters: [
                        ['item_name' ,'like' ,d.opportunity+'_%']
                       // ["Item","item_group", "in", item]
                    ]
                }
            });
            //---------------------------------------------------------------
        }
        else{
            var d = locals[cdt][cdn];
            var d = locals[cdt][cdn];
            var df = frappe.meta.get_docfield("BOM Item","activity_type", cur_frm.doc.name);
            var q_options = []; 
            $.each(frm.doc.activities || [], function(i, v) {
            q_options.push(v.activity_type)
            });
             df.options = q_options;
           
            frm.set_df_property("g_item", "reqd", 1);
            frm.set_query("item", function() {
                return {
                    filters: [
                        ["Item","item_group", "=", "Project Sellable Item"]
                    ]
                }
            });
            frm.fields_dict['items'].grid.get_field('item_code').get_query = function(doc, cdt, cdn) {
                var child = locals[cdt][cdn];
                //console.log(child);
                return {    
                    filters:[
                        ['item_group', '!=', 'Generic Component Item']
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
    validate: function(frm){

        if(!frm.doc.project_discount && frm.doc.docstatus == '0'){
            //set product discount name 
            frappe.call({
                method: 'frappe.client.get_value',
                args: {
                    'doctype': 'Project Discount',
                    'filters': {
                        //'project': frm.doc.project,
                        'opportunity':frm.doc.opportunity,
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
       
        frappe.confirm(
            'Make sure you have Applied Project Discount:',
            function(){
                window.close();
            },
            function(){
               // show_alert('Thanks for continue here!')
            }
        )
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
        
    
           
               total_cost= frm.doc.stock_material_cost+ frm.doc.activity_material_cost-frm.doc.total_discount
               frm.set_value("total_bom_cost",total_cost);
            
        
        //check rate difference between generic and project specific bom
       // if(frm.doc.type == 'Project'){
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
        //}              
    },
    
    btn_discount: function(frm,cdt,cdn){
       var d=locals[cdt][cdn]
       var total_discount_rate=0
       var material_cost=0
       var activity_cost=0
       var total_cost=0
        //calculate cost(material)
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
        
        total_cost=frm.doc.specific_activity_cost+frm.doc.specific_material_cost
       
        //set discount % and rate in bom item table
        $.each(frm.doc.bom_discount_detial || [], function(i, d) {
           var total_cost_with_discount = 0;
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
                            //total_cost_with_discount += (flt(v.amount) - flt(discount_rate));
                           // frm.set_value("specific_total_cost",total_cost_with_discount);
                            //frm.set_value("total_cost_with_discount",total_cost_with_discount);
                            frm.set_value("total_cost_with_discount",frm.doc.specific_material_cost- total_discount_rate);
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
        
        frm.set_value("total_bom_cost",flt(frm.doc.total_cost_with_discount) + flt(frm.doc.activity_material_cost));
    },
    type: function(frm){
        if(frm.doc.type == 'Project'){
            frm.set_value("project",null);
            frm.set_value("project_name",null);
            frm.set_value("g_bom",null);
            frm.set_value("g_item",null);
            frm.set_value("item",null);
            frm.clear_table("items");
            //frm.clear_table("bom_discount_detial");
            frm.refresh_field("project");
            frm.refresh_field("g_bom");
            frm.refresh_field("project_name");
            frm.refresh_field("g_item");
            frm.refresh_field("item");
            frm.refresh_field("items");
            //frm.refresh_field("bom_discount_detial");
        }
        if(frm.doc.type == 'General'){
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
                            d.uom = item.uom;
                            d.rate = item.rate;
                            d.qty = item.qty;
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
    opportunity: function(frm){          
        
            $.each(frm.doc.bom_discount_detial || [], function(i, d) {
                frappe.model.set_value(d.doctype, d.name,"opportunity",frm.doc.opportunity)
            });
       // }
    }
})
frappe.ui.form.on('BOM Item', { 
    
    item_code: function(frm, cdt, cdn){
        var d = locals[cdt][cdn];
        var df = frappe.meta.get_docfield("BOM Item","activity_type", cur_frm.doc.name);
        var q_options = []; 
        $.each(frm.doc.activities || [], function(i, v) {
            q_options.push(v.activity_type)
        });
        df.options = q_options;
       // frm.refresh_field('df.activity_type')
        if(frm.doc.type == 'General'){
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
                                'filters': {'parentfield': 'discount_detail','item_group': item_group,'opportunity': frm.doc.opportunity},
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
                                        d.opportunity = frm.doc.opportunity;
                                        d.discount_percentage = r.message.discount_percentage;
                                        cur_frm.refresh_field("bom_discount_detial");
                                }
                                else{
                                        d = frm.add_child("bom_discount_detial");
                                        d.item_group = item_group;
                                        d.opportunity = frm.doc.opportunity;
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
    refresh:function(frm,cdt,cdn)
 {
    var d = locals[cdt][cdn];
    if(d.activity_type){
        frappe.call({
            method: "electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_uom_details",
            args:{
                'activity_type': d.activity_type
                },
            callback:function(r){
        var df = frappe.meta.get_docfield("BOM Activities","uom", cur_frm.doc.name);
        var q_options = [];
        for (var i=0; i<r.message.length; i++){
            var a = r.message[i].uom;
            q_options.push(a)
        }
        df.options = q_options;   
    }
        });
    
        frappe.call({
            method: "electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_Activity_details",
            args:{
                'activity_type': d.activity_type
                },
            callback:function(r){
                var flag = false;
                for (var i=0; i<r.message.length; i++){
                    var uom= r.message[i].uom
                    if(d.uom == uom )
                        {
                            flag = true;
                            var rate =r.message[i].rate
                            frappe.model.set_value(d.doctype, d.name,"rate",rate)
                        }
                    
                }
                if(flag == false){
                    frappe.model.set_value(d.doctype, d.name,"rate",rate)
                    frappe.model.set_value(d.doctype, d.name,"base_activity_cost",activity_cost)
                    msgprint("Rate not found")
                }

            }
         });
    }
},

uom:function(frm,cdt,cdn)
 {
    var d = locals[cdt][cdn]
    if(d.activity_type){
    frappe.call({
            method: "electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_Activity_details",
            args:{
                'activity_type': d.activity_type
                },
                callback:function(r)
                {
                    var flag = false;
                    var rate =0;
                    var activity_cost =0
                    for (var i=0; i<r.message.length; i++)
                    {
                        var uom= r.message[i].uom;
                        if(d.uom == uom )
                        {
                            flag = true;
                            rate =r.message[i].rate;
                            frappe.model.set_value(d.doctype, d.name,"rate",rate)
                        }                                            
                    }
                    if(flag == false){
                        frappe.model.set_value(d.doctype, d.name,"rate",rate)
                        frappe.model.set_value(d.doctype, d.name,"base_activity_cost",activity_cost)
                        msgprint("Rate not found")
                    }

                }


               });
            }
},
qty:function(frm,cdt,cdn){

    var d = locals[cdt][cdn]
    var _mins = d.qty * d.rate;
    frappe.model.set_value(d.doctype, d.name,"base_activity_cost",_mins)

},
rate:function(frm,cdt,cdn){
    
    var d = locals[cdt][cdn]
    var _mins = d.qty * d.rate;
    frappe.model.set_value(d.doctype, d.name,"base_activity_cost",_mins)

}, 
});
