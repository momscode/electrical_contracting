// Copyright (c) 2020, momscode and contributors
// For license information, please see license.txt

frappe.ui.form.on('Activity Planner', {
    validate: function(frm,cdt,cdn){
        var d=locals[cdt][cdn]
          if(d.project && d.parent_task &&d.child_task!=null){
        
                    frappe.call({
                        method: 'frappe.client.get',
                         args:{
                            'doctype':'Activity Planner',
                            'filters':{
                                'project':d.project, 
                                'parent_task':d.parent_task,
                                'child_task':d.child_task,
                                'activity_item':d.activity_item,//data.message.subject,
                                'docstatus': 1,
                                //'is_default': 1
                            },
                            'fieldname':['name','activity_item',]
                        },
                    callback:function(r){
                        
                        if (!r.exc) {
                            if(r.message.activity_item==d.activity_item){ 
                                frappe.msgprint(__(d.activity_item +`  is Already Planned `));
                                frappe.validated = false;
                            }
                           
                        }
                    
                }
                    })  
                }
    },
    allow_holidays_as_working_days:function(frm,cdt,cdn){
        var d =locals[cdt][cdn];
        if(frm.doc.start_date&&frm.doc.end_date){
            if(d.allow_holidays_as_working_days==true)
            {
            var a=  frappe.datetime.get_day_diff(d.end_date,d.start_date)+1
            frm.set_value("total_days",a)
            } 
            else
            {
                if(frm.doc.start_date&&frm.doc.end_date)
                {
                frappe.call({
                    method: 'electrical_contracting.electrical_contracting.doctype.activity_planner.activity_planner.create_holidays',
                    args: { 
                        'start_date': d.start_date,
                        'end_date':d.end_date                
                    },
                    callback: function(r) {
                      var a=  frappe.datetime.get_day_diff(d.end_date,d.start_date)+1
                    
                        if(!r.exc){
                            var t_days =a-r.message.length
                            frm.set_value("total_days",t_days)
                            
                        }
                    }
                })
            }  
            }
        }
    },
    
    start_date:function(frm,cdt,cdn)
    {
        //var d =locals[cdt][cdn];
        var d =locals[cdt][cdn];
        if(d.start_date && d.end_date) {
			var from_date = Date.parse(d.start_date);
			var to_date = Date.parse(d.end_date);
			if(to_date < from_date){
				frappe.msgprint(__("Expected Start Date Should be Before Expected End Date"));
				frm.set_value('start_date', '');
				return;
            }
        }
        if(d.start_date)
        {
            frappe.call({
                method: 'electrical_contracting.electrical_contracting.doctype.activity_planner.activity_planner.start_date_holidays',
                args: { 
                    'start_date': d.start_date,
                },
                callback: function(r) {
                    if(!r.exc){
                        for (var i=0; i<r.message.length; i++){
                            var a = r.message[i].holiday_date;
                            if(d.start_date==a){
                                frappe.msgprint(__("Expected Start Date Should not be Holiday"));
                                frm.set_value('start_date', '');
                                return;
                            }
                        }
                        
                    }
                }
            }) 
        }
    },
	project:function(frm,cdt,cdn){
		var d =locals[cdt][cdn];
        if(frm.doc.project)
        {
            frm.set_query("parent_task", function() {
                return {
                    filters: [
						["Task","project", "=", d.project],
						["is_group","=",1]
                    ]
                }
            });
            frm.refresh_field("parent_task");
		}
    }, 
    
    
    /*onload:function(frm,cdt,cdn){
        var d =locals[cdt][cdn];
        if(frm.doc.project&&frm.doc.parent_task)
        {
        frappe.call({
            method: 'electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_generic_bom_activities',
            args: { 
                'g_bom': d.bom                
            },
            callback: function(r) {
              
                if(!r.exc){
                    
                    var df = frappe.meta.get_docfield("Activity Planner","activity_item", cur_frm.doc.name);
                   
                    var q_options = [];
                    for (var i=0; i<r.message.length; i++){
                        var a = r.message[i].activity_type;
                        q_options.push(a)
                    }
                df.options = q_options;
                frm.refresh_field("activity_item");
                }
            }
        })
    }
        
        
    },*/
    
    end_date:function(frm,cdt,cdn){
        var d =locals[cdt][cdn];
        if(d.start_date && d.end_date) {
            

			var from_date = Date.parse(d.start_date);
			var to_date = Date.parse(d.end_date);

			if(to_date < from_date){
				frappe.msgprint(__("Expected End Date Should be After Expected Start Date"));
				frm.set_value('end_date', '');
				return;
            }
            else{
                frappe.call({
                    method: 'electrical_contracting.electrical_contracting.doctype.activity_planner.activity_planner.start_date_holidays',
                    args: { 
                        'start_date': d.end_date,
                    },
                    callback: function(r) {
                        if(!r.exc){
                            for (var i=0; i<r.message.length; i++){
                                var a = r.message[i].holiday_date;
                                if(d.end_date==a){
                                    frappe.msgprint(__("Expected End Date Should not be Holiday"));
                                    frm.set_value('end_date', '');
                                    return;
                                }
                            }
                            
                        }
                    }
                })
                if(frm.doc.start_date&&frm.doc.end_date)
                {
                frappe.call({
                    method: 'electrical_contracting.electrical_contracting.doctype.activity_planner.activity_planner.create_holidays',
                    args: { 
                        'start_date': d.start_date,
                        'end_date':d.end_date                
                    },
                    callback: function(r) {
                      var a=  frappe.datetime.get_day_diff(d.end_date,d.start_date)+1
                    
                        if(!r.exc){
                            var t_days =a-r.message.length
                            frm.set_value("total_days",t_days)
                            frm.set_value("activity_type",d.activity_item)
                        }
                    }
                })
            }
            }
        }

    },
    activity_item:function(frm,cdt,cdn){
        var d=locals[cdt][cdn]
          if(d.project && d.parent_task &&d.child_task!=null){
                    frappe.call({
                        method: 'frappe.client.get_value',
                         args:{
                            'doctype':'Activity Planner',
                            'filters':{
                                'project':d.project, 
                                'parent_task':d.parent_task,
                                'child_task':d.child_task,
                                'activity_item':d.activity_item,//data.message.subject,
                                'docstatus': 1,
                                //'is_default': 1
                            },
                            'fieldname':['name','activity_item']
                        },
                    callback:function(r){
                        if (!r.exc) {
                            
                            if(r.message.activity_item==d.activity_item){ 
                                frappe.msgprint(__("Activity is Already Planned."));
                              return
                            }
                           
                        }
                    }
                    })  
                }
            
                frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Task",
                        name: d.child_task
                    },
                    callback:function(data){
                if(frm.doc.child_task && frm.doc.activity_item!=null){
                    var d =locals[cdt][cdn];
                    frappe.call({
                        method: 'electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_generic_bom_activities',
                        args: { 
                            'g_bom': d.bom                
                        },
                        callback: function(r) {
                          
                            if(!r.exc){
                                
                                for (var i=0; i<r.message.length; i++){
                        
                                    var item = r.message[i];
                                    
                                    if(d.activity_item==item.activity_type)
                                    {
                                        //frm.set_value("activity_duration",item.qty);
                                        frm.set_value("estimated_duration",item.qty*data.message.actual_qty)
                                    }
                                }
                                
                            }
                        }
                    })
                }
               
            }
        })                 

    },
	parent_task:function(frm,cdt,cdn){
		var d =locals[cdt][cdn];
		if(frm.doc.parent_task)
        {
			frm.set_query("child_task", function() {
                return {
                    filters: [
						["Task","parent_task", "=", d.parent_task],
                    ]
                }
            });
            frm.refresh_field("child_task");
        }
        if(frm.doc.parent_task != null)
{
      frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Task",
                name: frm.doc.parent_task
            },
            callback: function (data) {
                if(frm.doc.project && frm.doc.parent_task!=null){
                    var a=frm.doc.project+'_'+data.message.subject
                    frappe.call({
                        method: 'frappe.client.get_value',
                         args:{
                            'doctype':'BOM',
                            'filters':{
                                'item':a, //data.message.subject,
                                'docstatus': 1,
                                'is_default': 1
                            },
                            'fieldname':['name']
                        },
                    callback:function(r){
                        if (!r.exc) {
                            frm.set_value("bom",r.message.name);
                            if(frm.doc.project&&frm.doc.parent_task)
        {
        frappe.call({
            method: 'electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_generic_bom_activities',
            args: { 
                'g_bom': d.bom                
            },
            callback: function(r) {
              
                if(!r.exc){
                    
                    var df = frappe.meta.get_docfield("Activity Planner","activity_item", cur_frm.doc.name);
                   
                    var q_options = [];
                    for (var i=0; i<r.message.length; i++){
                        var a = r.message[i].activity_type;
                        q_options.push(a)
                    }
                df.options = q_options;
                frm.refresh_field("activity_item");
                }
            }
        })
    }
                        }
                    }
                });
            }
        }
        });
    } 
    },
    refresh:function(frm,cdt,cdn){
		var d =locals[cdt][cdn];
		if(frm.doc.parent_task)
        {
			frm.set_query("child_task", function() {
                return {
                    filters: [
						["Task","parent_task", "=", d.parent_task],
                    ]
                }
            });
            frm.refresh_field("child_task");
        }
        if(frm.doc.parent_task != null)
{
      frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Task",
                name: frm.doc.parent_task
            },
            callback: function (data) {
                if(frm.doc.project && frm.doc.parent_task!=null){
                    var a=frm.doc.project+'_'+data.message.subject
                    frappe.call({
                        method: 'frappe.client.get_value',
                         args:{
                            'doctype':'BOM',
                            'filters':{
                                'item':a, //data.message.subject,
                                'docstatus': 1,
                                'is_default': 1
                            },
                            'fieldname':['name']
                        },
                    callback:function(r){
                        if (!r.exc) {
                            frm.set_value("bom",r.message.name);
                            if(frm.doc.project&&frm.doc.parent_task)
        {
        frappe.call({
            method: 'electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_generic_bom_activities',
            args: { 
                'g_bom': d.bom                
            },
            callback: function(r) {
              
                if(!r.exc){
                    
                    var df = frappe.meta.get_docfield("Activity Planner","activity_item", cur_frm.doc.name);
                   
                    var q_options = [];
                    for (var i=0; i<r.message.length; i++){
                        var a = r.message[i].activity_type;
                        q_options.push(a)
                    }
                df.options = q_options;
                frm.refresh_field("activity_item");
                }
            }
        })
    }
                        }
                    }
                });
            }
        }
        });
    } 
    },
    before_submit: function(frm,cdt,cdn) {
        var d=locals[cdt][cdn]
        frappe.call({
            method: "electrical_contracting.electrical_contracting.doctype.activity_planner.activity_planner.on_activity_after_submit",
            args:{
                'child_task':d.child_task,
                'activity_item':d.activity_item

            },
            callback:function(r){
                frappe.call({
                    method: "electrical_contracting.electrical_contracting.doctype.activity_planner.activity_planner.on_estimated_after_submit",
                    args:{
                        'child_task':d.child_task,
                        'activity_item':d.activity_item,
                        'estimated_duration':d.estimated_duration,
        
                    },
                    callback:function(r){
                        
                        
                    }
        })
    }
})
    }
    
    
    });
    frappe.ui.form.on('Activity Planner', {
	
        setup(frm) {
            frm.make_methods = {
                'Material Request': () => {
                    open_form(frm, "Material Request", null, null);
                },
            };
        },
    });
    function open_form(frm, doctype, child_doctype, parentfield) {
        frappe.model.with_doctype(doctype, () => {
            let new_doc = frappe.model.get_new_doc(doctype);
            new_doc.activity_planner  = frm.doc.name;
            new_doc.bom  = frm.doc.bom;
            new_doc.material_request_type = 'Material Issue';
            new_doc.project = frm.doc.project;
            new_doc.activity_type = frm.doc.activity_type;
            new_doc.parent_task = frm.doc.parent_task;
            new_doc.child_task = frm.doc.child_task;
            new_doc.task = frm.doc.child_task;
            //new_doc.qty=frm.doc.
            frappe.ui.form.make_quick_entry(doctype, null, null, new_doc);
        });
    }
   