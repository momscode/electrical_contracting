#added on 21-11-2019
import frappe

from frappe.model.naming import set_name_by_naming_series
@frappe.whitelist()
def sum_of_actual_qty(parent_task,current_task):
     task_list = frappe.db.sql("""select name from `tabTask` where parent_task=%s and name=%s""",(parent_task,current_task),as_dict=1)
     if task_list:
         sum_actual_qty = frappe.db.sql("select sum(actual_qty) as actual_qty from `tabTask` where parent_task=%s and name!=%s",(parent_task,current_task), as_dict=True)[0]        
     else:
          sum_actual_qty = frappe.db.sql("select sum(actual_qty) as actual_qty from `tabTask` where parent_task=%s", parent_task, as_dict=True)[0]
     return sum_actual_qty
    
        
        