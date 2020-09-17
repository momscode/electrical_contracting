
frappe.ui.form.on("Task", {
    parent_task:function(frm,cdt,cdn)
    {
        if(frm.doc.parent_task != null)
{
      frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Task",
                name: frm.doc.parent_task
            },
            callback: function (data) {
                cur_frm.set_value("parent_qty",data.message.actual_qty);
            }
      });
    }    

    },
    validate: function(frm) {
    frm.doc.project && frappe.model.remove_from_locals("Project",
        frm.doc.project);
        if(frm.doc.actual_qty<frm.doc.completed_qty)
        {
            frappe.msgprint(__(`Completed Qty Exceeds the Planned Qty`));
            frappe.validated = false;
        }
},
validate: function(frm) {
    if(frm.doc.parent_task)
    {
        if(frm.doc.actual_qty>frm.doc.parent_qty)
        {
            frappe.msgprint(__(`Planned Qty Exceeds the Actual Qty`));
            frappe.validated = false;
        }
    }
},


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
                                    parent_task: frm.doc.parent_task
                                    //current_task: frm.doc.name
                                },
                                callback: function (d) {
                                      if(d.message!=0)
                                           {
                                            sum_child_task_actual_qty= parseInt(d.message.actual_qty)+parseInt(frm.doc.actual_qty);
                                              if(sum_child_task_actual_qty>parent_task_actual_qty)
                                               {
                                                  cur_frm.set_value("actual_qty",0);
                                                  frappe.msgprint(__(`Total quantity Of child task ${sum_child_task_actual_qty} exceeds the quantity of parent task ${parent_task_actual_qty}`));
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