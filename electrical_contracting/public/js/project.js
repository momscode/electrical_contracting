frappe.ui.form.on('Project', {
	setup(frm) {
		frm.make_methods = {
			'BOM': () => {
				open_form(frm, "BOM", null, null);
			},
		};
	}
});
function open_form(frm, doctype, child_doctype, parentfield) {
	frappe.model.with_doctype(doctype, () => {
        let new_doc = frappe.model.get_new_doc(doctype);
        new_doc.type  = 'Project';
        new_doc.project_name = frm.doc.name;
        new_doc.project = frm.doc.name;

		frappe.ui.form.make_quick_entry(doctype, null, null, new_doc);
	});

}