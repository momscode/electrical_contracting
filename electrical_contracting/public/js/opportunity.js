frappe.ui.form.on('Opportunity', {
        refresh(frm) {
                frm.remove_custom_button("Close");
                frm.remove_custom_button("Lost");
                frm.remove_custom_button("Reopen");
                frm.set_query("industry_type", function() {
                        return {
                                "query": "electrical_contracting.electrical_contracting.doctype.opportunity.opportunity_custom.get_industry_type"
                            //order_by : 'industry'
                        }
                });
	}
});