# -*- coding: utf-8 -*-
# Copyright (c) 2020, momscode and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class ProjectMeasurement(Document):
	pass
@frappe.whitelist()
def on_Project_measurement_after_submit(qty,child_task):
        #completed_qty=doc.completed_qty+doc.qty
        frappe.db.sql("""update `tabTask` set completed_qty = %s where name =%s""",((qty), child_task))
        return
		#frappe.msgprnt("hi")
@frappe.whitelist()
def on_Project_measurement_Measured_after_submit(qty,child_task):
        frappe.db.sql("""update `tabTask` set measured_qty = %s where name =%s""",((qty), child_task))
        
        return

def on_project_measurement_on_cancel(doc, handler=""):
        if(doc.type=='Completed'):
                frappe.db.sql("""update `tabTask` set completed_qty = %s where name =%s""",(doc.completed_qty,doc.child_task))
        else:
            frappe.db.sql("""update `tabTask` set measured_qty = %s where name =%s""",((doc.measured_qty), doc.child_task))    
        return

def on_project_measurement_submit(doc, handler=""):
        if(doc.type=='Validated'):
                total_qty =doc.qty + doc.measured_qty
                if(total_qty==doc.planned_qty):
                        frappe.db.sql("""update `tabTask` set status ='Completed' where name=%s """,(doc.child_task))
        		
        return