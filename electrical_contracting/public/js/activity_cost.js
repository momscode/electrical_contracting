frappe.ui.form.on("Activity Cost", {
    billing_rate_in_mins: function(frm) {
		frm.set_value("billing_rate",frm.doc.billing_rate_in_mins/60)
    },
    costing_rate_in_mins: function(frm) {
		frm.set_value("costing_rate",frm.doc.costing_rate_in_mins/60)
    },
    billing_rate: function(frm) {
		frm.set_value("billing_rate_in_mins",frm.doc.billing_rate*60)
    },
    costing_rate: function(frm) {
		frm.set_value("costing_rate_in_mins",frm.doc.costing_rate*60)
    }
    });