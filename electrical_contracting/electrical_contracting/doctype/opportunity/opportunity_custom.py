import frappe

@frappe.whitelist()
def get_industry_type(doctype, txt, searchfield, start, page_len, filters):
    return frappe.db.sql("""select industry from `tabIndustry Type` order by industry asc""")