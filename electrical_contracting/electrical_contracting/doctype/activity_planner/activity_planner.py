# -*- coding: utf-8 -*-
# Copyright (c) 2020, momscode and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe.model.document import Document
from frappe.utils import add_days, cint, cstr, flt, getdate, rounded, date_diff, money_in_words
class ActivityPlanner(Document):
	pass
@frappe.whitelist()
def create_activity_planner(source_name, target_doc=None):
        doclist = get_mapped_doc("Task", source_name, {
                "Task": {
                        "doctype": "Activity Planner",
                        "field_map": {
                                "name": "task"

                        }
                }
        }, target_doc)
        return doclist
@frappe.whitelist()
def create_holidays(start_date,end_date):
    bom_activity_list = frappe.db.sql("""select holiday_date from `tabHoliday`
        where  holiday_date >= %s and holiday_date <= %s """,(start_date,end_date),as_dict=1)
    return bom_activity_list

@frappe.whitelist()
def start_date_holidays(start_date):
    holiday_list = frappe.db.sql("""select holiday_date from `tabHoliday`
        where  holiday_date = %s """,(start_date),as_dict=1)
    return holiday_list
@frappe.whitelist()
def on_activity_after_submit(child_task,activity_item):
        #completed_qty=doc.completed_qty+doc.qty
        frappe.db.sql("""update `tabActivity Data` set status ='Planned' where parent=%s and activity_item=%s""",(child_task,activity_item))
        return
@frappe.whitelist()
def on_estimated_after_submit(child_task,activity_item,estimated_duration):
        frappe.db.sql("""update `tabActivity Data` set estimated =%s where parent=%s and activity_item=%s""",(estimated_duration,child_task,activity_item))
        return
