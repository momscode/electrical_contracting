import frappe



@frappe.whitelist()
def get_sales_order_items(doctype, txt, searchfield, start, page_len, filters):

    return frappe.db.sql("""select si.item_code
    from `tabSales Order Item` si, `tabSales Order` s
    where s.name = si.parent and si.parenttype = 'Sales Order'
    and s.docstatus = 1 and 
    si.item_code not in(select g_item from `tabBOM` where type = 'Project' and g_item = si.item_code and docstatus<2)
    and si.parent = (select name from `tabSales Order` where project = %s and docstatus = 1)""",(filters.get('project')))


@frappe.whitelist()
def get_generic_details(g_bom):
    bom_item_list = frappe.db.sql("""select bi.item_code,i.item_group,bi.activity_type,bi.qty,bi.uom,bi.rate,bi.amount,
    bi.activity_uom,bi.activity_qty 
    from `tabBOM Item` bi, `tabBOM` b, `tabItem` i
    where b.name = bi.parent and bi.parenttype = 'BOM'
    and bi.item_code = i.item_code and i.disabled = 0
    and bi.docstatus = 1 and bi.parent = %s order by bi.idx asc""",(g_bom),as_dict=1)

    return bom_item_list




