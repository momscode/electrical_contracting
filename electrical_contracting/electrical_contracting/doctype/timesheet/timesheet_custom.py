from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class ProjectMeasurement(Document):
	pass

def on_timesheet_after_submit(doc, handler=""):
        if(doc.activity_planner!=''):
                total =doc.utilized + doc.total_minutes
                frappe.db.sql("""update `tabActivity Planner` set utilized = %s where name =%s""",((total), doc.activity_planner))
                frappe.db.sql("""update `tabActivity Data` set utilized =%s where parent=%s and activity_item=%s""",(total,doc.child_task,doc.activity_type))
                frappe.db.sql("""update `tabTask` set status ='Working' where name=%s """,(doc.child_task))
                over =doc.utilized + doc.total_minutes
                if(doc.estimated_duration<over):
                        over_utilized=total-doc.estimated_duration
                        frappe.db.sql("""update `tabActivity Planner` set overutilized = %s where name =%s""",((over_utilized), doc.activity_planner))
                        frappe.db.sql("""update `tabActivity Data` set additional_consumed =%s where parent=%s and activity_item=%s""",(over_utilized,doc.child_task,doc.activity_type))
        return                
def on_timesheet_on_cancel(doc, handler=""):
        frappe.msgprint("hai")
        frappe.db.sql("""update `tabActivity Planner` set utilized = %s where name =%s""",((doc.utilized), doc.activity_planner))
        frappe.db.sql("""update `tabActivity Data` set utilized =%s where parent=%s and activity_item=%s""",(doc.utilized,doc.child_task,doc.activity_type))
        if(doc.utilized>doc.estimated_duration):
                over_utilized=doc.utilized-doc.estimated_duration
                frappe.db.sql("""update `tabActivity Planner` set overutilized = %s where name =%s""",((over_utilized), doc.activity_planner))
                frappe.db.sql("""update `tabActivity Data` set additional_consumed =%s where parent=%s and activity_item=%s""",(over_utilized,doc.child_task,doc.activity_type))
        else:
                frappe.db.sql("""update `tabActivity Planner` set overutilized = %s where name =%s""",((0), doc.activity_planner))
                frappe.db.sql("""update `tabActivity Data` set additional_consumed =%s where parent=%s and activity_item=%s""",(0,doc.child_task,doc.activity_type))



        return
