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
                        var df = frappe.meta.get_docfield("","activity_type", cur_frm.doc.name);
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

});