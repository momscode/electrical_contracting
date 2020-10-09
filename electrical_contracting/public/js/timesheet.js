frappe.ui.form.on('Timesheet', {
    refresh:function(frm){
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
    },
    before_submit:function(frm)
    {
        debugger;
alert("hai")
    },
    before_submit:function(frm) {
        var total_minutes = 0;
        $.each(frm.doc.time_logs || [], function(i, v) {
            
            total_minutes = total_minutes + v.minutes
        })
        frm.set_value("total_minutes",total_minutes);
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
                        'subject'
                    ]                   
                },
                callback: function(r){
                    if(!r.exc){
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
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    },
    bom:function(frm){
        if(frm.doc.task && frm.doc.project && frm.doc.bom)
        {
            frappe.call({
                method: "electrical_contracting.electrical_contracting.doctype.bom.bom_custom.get_bom_items",
                args:{
                    'g_bom': frm.doc.bom
                    
                },
                callback:function(r){
                    if(!r.exc){
                        var df = frappe.meta.get_docfield("Timesheet Details","activity_item", cur_frm.doc.name);
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
      
} ,

validate: function(frm) {
    var total_minutes = 0;
    $.each(frm.doc.time_logs || [], function(i, v) {
        total_minutes = total_minutes + v.minutes
    })
    frm.set_value("total_minutes",total_minutes);
   /* if(frm.doc.activity_planner!=null)
    {
        var total =frm.doc.utilized + frm.doc.total_minutes
        if(frm.doc.estimated_duration<total)
        {
           var  over_utilized=total-frm.doc.estimated_duration
           alert(frm.doc.activity_type)
            frappe.call({
                method: "electrical_contracting.electrical_contracting.doctype.timesheet.timesheet_custom.update_over_utilized",
                args:{
                    'child_task': frm.doc.child_task,
                    'over_utilized':over_utilized,
                    'activity_item':frm.doc.activity_type
                },
                callback:function(r){
                    alert("hai")
                }
            });       
        }
        frappe.call({
            method: "electrical_contracting.electrical_contracting.doctype.timesheet.timesheet_custom.on_timesheet_after_submit",
            args:{
                'activity_planner': frm.doc.activity_planner,
                'utilized':total,
                'activity_item':frm.doc.activity_type
            },
            callback:function(r){
                alert(frm.doc.child_task)
                frappe.msgprint(__(`Updated Utilized Qty`));
                frappe.call({
                    method: "electrical_contracting.electrical_contracting.doctype.timesheet.timesheet_custom.on_task_after_submit",
                    args:{
                       //'activity_planner': frm.doc.activity_planner,
                        'utilized':total,
                        'child_task':frm.doc.child_task,
                        'activity_item':frm.doc.activity_type
                    },
                    callback:function(r){
                    }
                })

            }
        })
    }*/
    
},
activity_planner:function(frm,cdt,cdn){
    frappe.call({
        method: 'frappe.client.get_value',
        args:{
            'doctype':'Activity Planner',
            'filters':{
                'name': frm.doc.activity_planner,
                'docstatus':1
            },
            'fieldname':[
                'utilized',
                'estimated_duration'
                
            ]
        },
        callback:function(s){
            if (!s.exc) {
                frm.set_value("utilized",s.message.utilized);
                frm.set_value("estimated_duration",s.message.estimated_duration);
               // frm.set_value("measured_qty",s.message.measured_qty);
            }
        }
    });

},
});

frappe.ui.form.on('Timesheet Detail', {
    to_time: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        var entry_datetime = d.from_time.split(" ")[1];
        var exit_datetime = d.to_time.split(" ")[1];
        var splitEntryDatetime = entry_datetime.split(':');
        var splitExitDatetime = exit_datetime.split(':');
        var hourInMinOfEntry = splitEntryDatetime[0] * 60;
        var hourInMinOfExit = splitExitDatetime[0] * 60;
        var secondInMinOfEntry = splitEntryDatetime[0] / 60;
        var secondInMinOfExit = splitExitDatetime[0] / 60;
        var totalMinsOfEntry = hourInMinOfEntry + parseInt(splitEntryDatetime[1]) + secondInMinOfEntry;
        var totalMinsOfExit = hourInMinOfExit + parseInt(splitExitDatetime[1]) + secondInMinOfExit;
        var entry_date = new Date(d.from_time.split(" ")[0]);
        var exit_date = new Date(d.to_time.split(" ")[0]);
        var diffTime = Math.abs(exit_date - entry_date);
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        var DaysDiffInMins = diffDays * (24 * 60);
        var result = (DaysDiffInMins + totalMinsOfExit) - totalMinsOfEntry;
        frappe.model.set_value(d.doctype, d.name,"minutes",parseFloat(result))
    },
    from_time: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        var entry_datetime = d.from_time.split(" ")[1];
        var exit_datetime = d.to_time.split(" ")[1];
        var splitEntryDatetime = entry_datetime.split(':');
        var splitExitDatetime = exit_datetime.split(':');
        var hourInMinOfEntry = splitEntryDatetime[0] * 60;
        var hourInMinOfExit = splitExitDatetime[0] * 60;
        var secondInMinOfEntry = splitEntryDatetime[0] / 60;
        var secondInMinOfExit = splitExitDatetime[0] / 60;
        var totalMinsOfEntry = hourInMinOfEntry + parseInt(splitEntryDatetime[1]) + secondInMinOfEntry;
        var totalMinsOfExit = hourInMinOfExit + parseInt(splitExitDatetime[1]) + secondInMinOfExit;
        var entry_date = new Date(d.from_time.split(" ")[0]);
        var exit_date = new Date(d.to_time.split(" ")[0]);
        var diffTime = Math.abs(exit_date - entry_date);
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        var DaysDiffInMins = diffDays * (24 * 60);
        var result = (DaysDiffInMins + totalMinsOfExit) - totalMinsOfEntry;
        frappe.model.set_value(d.doctype, d.name,"minutes",parseFloat(result))
    },

});

