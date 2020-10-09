frappe.ui.form.on('Project Measurement', {
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
		},
	child_task:function(frm,cdt,cdn){
		frappe.call({
            method: 'frappe.client.get_value',
            args:{
                'doctype':'Task',
                'filters':{
                    'name': frm.doc.child_task
                },
                'fieldname':[
                    'actual_qty',
                    'completed_qty',
                    'measured_qty'
                ]
			},
			callback:function(s){
                if (!s.exc) {
					frm.set_value("planned_qty",s.message.actual_qty);
					frm.set_value("completed_qty",s.message.completed_qty);
					frm.set_value("measured_qty",s.message.measured_qty);
				}
			}
		});
	} ,
	before_submit:function(frm) {
		if(frm.doc.planned_qty<frm.doc.qty)
		{
			frm.set_value("qty",0);
			frappe.msgprint(__(`Qty Exceeds Planned Qty`));
			frappe.validated = false;
		}
		else{
			if(frm.doc.type=='Completed'){
				var total_qty =frm.doc.qty + frm.doc.completed_qty
				if(total_qty>frm.doc.planned_qty){
					frm.set_value("qty",0);
					frappe.msgprint(__(`Completed Qty Exceeds  Planned Qty`));
					frappe.validated = false;	
				}
				else{
					var total_qty =frm.doc.qty + frm.doc.completed_qty
					frappe.call({
						method: "electrical_contracting.electrical_contracting.doctype.project_measurement.project_measurement.on_Project_measurement_after_submit",
						args:{
							'qty': total_qty,
							'child_task':frm.doc.child_task
						},
						callback:function(r){
							
							frappe.msgprint(__(`Completed Qty in `+frm.doc.child_task +' is Updated.'));	
						}
					})
				}
			}
			else{
				var total_qty =frm.doc.qty + frm.doc.measured_qty
				if(total_qty>frm.doc.planned_qty)
				{
					frm.set_value("qty",0);
					frappe.msgprint(__(`Validated Qty Exceeds Planned Qty`));
					frappe.validated = false;	
				}
				else
				{
					var total_qty =frm.doc.qty + frm.doc.measured_qty
					frappe.call({
						method: "electrical_contracting.electrical_contracting.doctype.project_measurement.project_measurement.on_Project_measurement_Measured_after_submit",
						args:{
							'qty': total_qty,
							'child_task':frm.doc.child_task
						},
						callback:function(r){
							
							frappe.msgprint(__(`Validated Qty in `+frm.doc.child_task +' is Updated.'));	
						}
					})
				}
				
			}
			
		}	
},  
	validate:function(frm) {
		
			if(frm.doc.planned_qty<frm.doc.qty)
			{
				frm.set_value("qty",0);
				frappe.msgprint(__(`Qty Exceeds Planned Qty`));
				frappe.validated = false;
			}
			else{
				if(frm.doc.type=='Completed')
				{
					var total_qty =frm.doc.qty + frm.doc.completed_qty
					if(total_qty>frm.doc.planned_qty)
					{
						frm.set_value("qty",0);
						frappe.msgprint(__(`Completed Qty Exceeds  Planned Qty`));
						frappe.validated = false;	
					}
					
				}
				else{
					var total_qty =frm.doc.qty + frm.doc.measured_qty
					if(total_qty>frm.doc.planned_qty)
					{
						frm.set_value("qty",0);
						frappe.msgprint(__(`Validated Qty Exceeds Planned Qty`));
						frappe.validated = false;	
					}	
				}
				
			}	
	},  
	
});
