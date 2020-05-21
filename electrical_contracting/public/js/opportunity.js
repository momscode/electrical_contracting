frappe.ui.form.on('Opportunity', {
	refresh(frm) {
        frm.remove_custom_button("Close");
        frm.remove_custom_button("Lost");
        frm.remove_custom_button("Reopen");
	}
});