frappe.ui.form.on('Material Request', {
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
            msgprint('hi1');
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
                        msgprint(r.message.subject);
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
                                    'name',
                                ]                   
                            },
                            callback: function(n){
                                if(!n.exc){
                                    if(n.message.name){
                                        frm.set_value("bom",n.message.name);
                                    }
                                }
                            }
                        })

                    }
                }
            })
        }
    }
});