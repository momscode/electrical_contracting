
frappe.ui.form.on("Task", { 
    onload:function(frm){
        if(frm.doc.is_group==1)
        {
        frm.set_df_property('parent_qty',  'hidden',  frm.doc.__islocal ? 0 : 1);
        }
}, 
    status: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        if (d.is_group == 1) {
            frappe.call({
                method: "electrical_contracting.electrical_contracting.doctype.task.task_custom.get_activity_data",
                args: {
                    'parent_task': d.name
                },
                callback: function (r) {
                    if (!r.exc) {
                        frm.clear_table("activity_data");
                        frm.refresh_field("activity_data");
                        for (var i = 0; i < r.message.length; i++) {
                            var d = frm.add_child("activity_data");
                            var item = r.message[i];
                            frappe.model.set_value(d.doctype, d.name, "activity_item", item.activity_item);
                            frappe.model.set_value(d.doctype, d.name, "estimated", item.estimated);
                            frappe.model.set_value(d.doctype, d.name, "utilized", item.utilized);
                            frappe.model.set_value(d.doctype, d.name, "additional_consumed", item.overutilized);
                            frappe.model.set_value(d.doctype, d.name, "status", item.status);
                            frm.refresh_field("activity_data");
                        }
                    }
                }
            });
            var d=locals[cdt][cdn]
            if(d.is_group==1)
            {
                frappe.call({
                    method: "electrical_contracting.electrical_contracting.doctype.task.task_custom.get_all_child_data_values",
                    args:{
                        'project': d.project,
                        'task':d.name
                    },
                    callback:function(r){
                        cur_frm.set_value("completed_qty",r.message.completed_qty);
                        cur_frm.set_value("measured_qty",r.message.validated_qty);
                    }
                });
            }
        }
    },

 parent_task:function(frm,cdt,cdn){
        var d=locals[cdt][cdn]
        if(frm.doc.parent_task != null){
            frappe.call({
                "method": "frappe.client.get",
                args: {
                  doctype: "Task",
                  name: frm.doc.parent_task
                },
            callback: function (data) {
                cur_frm.set_value("parent_qty",data.message.actual_qty);
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
                            frappe.call({
                                method: "electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_generic_bom_activities",
                                args:{
                                    'g_bom': r.message.name
                                },
                                callback:function(r){
                                    if(!r.exc){
                                        frm.clear_table("activity_data");
                                        frm.refresh_field("activity_data");
                                        for (var i=0; i<r.message.length; i++){
                                            var d = frm.add_child("activity_data");
                                            var item = r.message[i];
                                            //d.activity_type = item.activity_type;
                                            frappe.model.set_value(d.doctype, d.name, "activity_item", item.activity_type);
                                            //d.uom = item.uom;
                                            //d.estimated = item.rate*parent_qty;
                                            //d.qty = item.qty;
                                           // d.estimated = item.qty*d.actual_qty;
                                            d.status='Pending'
                                            d.parent_task=frm.doc.parent_task
                                            //frappe.model.set_value(d.doctype, d.name, "parent_task", d.parent_task);
                
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
                                            frm.refresh_field("activity_data");
                                        }
                                    }
                                }
                            })
                        }
                    }
                    });
                
                }
        }
      });

    }    

    },
    validate: function(frm) {
    frm.doc.project && frappe.model.remove_from_locals("Project",
        frm.doc.project);
        if(frm.doc.actual_qty<frm.doc.completed_qty)
        {
            frappe.msgprint(__(`Completed Qty Exceeds  Planned Qty`));
            frappe.validated = false;
        }
        
},
validate: function(frm) {
    if(frm.doc.parent_task){
        if(frm.doc.actual_qty>frm.doc.parent_qty){
            frappe.msgprint(__(`Planned Qty Exceeds Sales Order Qty`));
            frappe.validated = false;
        }
    }
},
actual_qty:function(frm,cdt,cdn){
    var d=locals[cdt][cdn];
    if(d.parent_task)
    {
        if(d.actual_qty>d.parent_qty)
        {
            frappe.msgprint(__(`Planned Qty Exceeds Sales Order Qty`));
            frm.set_value('actual_qty', '');
            return;
        }
    } 
}

});


cur_frm.add_fetch('task', 'subject', 'subject');
cur_frm.add_fetch('task', 'project', 'project');

//To check sum of actual qty of child task
frappe.ui.form.on("Task", {
validate: function(frm) {
if (frm.doc.completed_qty > frm.doc.actual_qty) {
    frappe.msgprint(__(`Completed Quantity Cannot be greater than Planned Quantity.`));
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
               var sum_child_task_actual_qty=0
               var parent_task_actual_qty=0
               if(data.message!=0)
                 {
                   parent_task_actual_qty=data.message.actual_qty;
                    frappe.call({
                            "method": "electrical_contracting.electrical_contracting.doctype.task.task_custom.sum_of_actual_qty",
                            args: {
                                    parent_task: frm.doc.parent_task,
                                    current_task: frm.doc.name
                                },
                                callback: function (d) {
                                      if(d.message!=0)
                                           {  
                                            sum_child_task_actual_qty= parseInt(d.message.actual_qty)+parseInt(frm.doc.actual_qty);
                                              if(sum_child_task_actual_qty>parent_task_actual_qty)
                                               {
                                                  cur_frm.set_value("actual_qty",0);
                                                  frappe.msgprint(__(`Total Qty Of Child Task ${sum_child_task_actual_qty} Exceeds  Qty of Parent Task ${parent_task_actual_qty}`));
                                                  frappe.validated = false;
                                               }
                                           }
                                     }
                    })
                 }
            }
        })
}
},
});
cur_frm.cscript.create_activity_planner = function(doc) {
    frappe.model.open_mapped_doc({
             method: "electrical_contracting.electrical_contracting.doctype.task.task_custom.create_activity_planner",
             frm: cur_frm
         })
        }

frappe.ui.form.on('Task', {
	
	setup(frm) {
		frm.make_methods = {
			'Activity Planner': () => {
				open_form(frm, "Activity Planner", null, null);
			},
			'Project Measurement': () => {
				open_form_project_measurement(frm, "Project Measurement", null, null);
			},
		};
	},
});
function open_form(frm, doctype, child_doctype, parentfield) {
	frappe.model.with_doctype(doctype, () => {
        let new_doc = frappe.model.get_new_doc(doctype);
        new_doc.task  = frm.doc.name;
        new_doc.child_task  = frm.doc.name;
        new_doc.parent_task = frm.doc.parent_task;
        new_doc.project = frm.doc.project;
		frappe.ui.form.make_quick_entry(doctype, null, null, new_doc);
	});
}
function open_form_project_measurement(frm, doctype, child_doctype, parentfield) {
	frappe.model.with_doctype(doctype, () => {
        let new_doc = frappe.model.get_new_doc(doctype);
        new_doc.task  = frm.doc.name;
        new_doc.child_task  = frm.doc.name;
        new_doc.parent_task = frm.doc.parent_task;
        new_doc.project = frm.doc.project;
		frappe.ui.form.make_quick_entry(doctype, null, null, new_doc);
	});
}