#added on 21-11-2019
from __future__ import unicode_literals
import frappe
from frappe.model.mapper import get_mapped_doc  
from frappe.model.document import Document
from frappe.model.document import get_doc
from frappe.model.document import Document

from frappe.model.naming import set_name_by_naming_series
@frappe.whitelist()
def sum_of_actual_qty(parent_task,current_task):
     task_list = frappe.db.sql("""select name from `tabTask` where parent_task=%s and name=%s""",(parent_task,current_task),as_dict=1)
     if task_list:
         sum_actual_qty = frappe.db.sql("select sum(actual_qty) as actual_qty from `tabTask` where parent_task=%s and name!=%s",(parent_task,current_task), as_dict=True)[0]        
     else:
          sum_actual_qty = frappe.db.sql("select sum(actual_qty) as actual_qty from `tabTask` where parent_task=%s", parent_task, as_dict=True)[0]
     return sum_actual_qty
@frappe.whitelist()
def create_activity_planner(source_name, target_doc=None):
        frappe.msgprint("hai")
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
def get_all_child_data_values(project,task):
     task_list = frappe.db.sql("""select name from `tabTask` where parent_task=%s and project=%s""",(task,project),as_dict=1)
     if task_list:
         completed_qty = frappe.db.sql("select sum(completed_qty) as completed_qty,sum(measured_qty) as validated_qty from `tabTask` where parent_task=%s and project=%s and docstatus=1",(task,project), as_dict=True)[0]        
     return completed_qty 
@frappe.whitelist()
def get_all_activity_data(project,task):
        frappe.msgprint("hai")
     task_list = frappe.db.sql("""select name from `tabTask` where parent_task=%s and project=%s""",(task,project),as_dict=1)
     for b in task_list:
             sum_of_duration= frappe.db.sql("select sum(estimated) as estimated from `tabActivity Data` where parent=%s and docstatus=1",(b.name), as_dict=True)[0]   
     return sum_of_duration       
        
        
