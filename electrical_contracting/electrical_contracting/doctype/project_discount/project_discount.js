// Copyright (c) 2020, momscode and contributors
// For license information, please see license.txt

frappe.ui.form.on('Project Discount', {
	// refresh: function(frm) {

	// }
	update_bom: function(frm){
		frappe.call({
			doc: frm.doc,
			method: "create_bom_from_project_discount",
			freeze: true,
			callback: function(r){
				if(!r.exc){
					alert('new boms created');
				}
			}
		});
	}
});