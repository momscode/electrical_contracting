# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "electrical_contracting"
app_title = "Electrical Contracting"
app_publisher = "momscode"
app_description = "App for Electrical Contracting company"
app_icon = "octicon octicon-briefcase"
app_color = "grey"
app_email = "info@momscode.in"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/electrical_contracting/css/electrical_contracting.css"
# app_include_js = "/assets/electrical_contracting/js/electrical_contracting.js"

# include js, css files in header of web template
# web_include_css = "/assets/electrical_contracting/css/electrical_contracting.css"
# web_include_js = "/assets/electrical_contracting/js/electrical_contracting.js"

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
doctype_js = {
    "Activity Cost" : "public/js/activity_cost.js",
    "BOM" : "public/js/bom.js",
    "Project" : "public/js/project.js",
    "Quotation":"public/js/quotation.js",
    "Opportunity":"public/js/opportunity.js",
    "Sales Order":"public/js/sales_order.js",
    "Material Request":"public/js/material_request.js",
    "Timesheet":"public/js/timesheet.js",
    "Task":"public/js/task.js",
    "Stock Entry":"public/js/stock_entry.js"
    }
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
doctype_list_js = {
    "BOM" : "public/js/bom_list.js"
    
    }
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "electrical_contracting.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "electrical_contracting.install.before_install"
# after_install = "electrical_contracting.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "electrical_contracting.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
    "BOM": {
        "after_insert": "electrical_contracting.electrical_contracting.doctype.project_discount.project_discount.on_bom_on_save",
        "on_change": "electrical_contracting.electrical_contracting.doctype.project_discount.project_discount.on_bom_on_change",
        "on_submit":"electrical_contracting.electrical_contracting.doctype.bom.bom_custom.on_BOM_after_submit"
    },
    "Project Discount": {
        "before_insert":"electrical_contracting.electrical_contracting.doctype.project_discount.project_discount.before_insert"
    },
    "Project":{
        "after_insert":"electrical_contracting.electrical_contracting.doctype.project.project_custom.on_project_on_submit",
        "autoname":"electrical_contracting.electrical_contracting.doctype.project.project_custom.autoname"
    },
    "Sales Order":{
        "on_submit":"electrical_contracting.electrical_contracting.doctype.sales_order.sales_order_custom.on_sales_order_after_submit"
    },
    "Project Measurement":{
        "on_cancel":"electrical_contracting.electrical_contracting.doctype.project_measurement.project_measurement.on_project_measurement_on_cancel",
        "on_submit":"electrical_contracting.electrical_contracting.doctype.project_measurement.project_measurement.on_project_measurement_submit"
    },
    "Timesheet":{
        "on_submit":"electrical_contracting.electrical_contracting.doctype.timesheet.timesheet_custom.on_timesheet_after_submit",
        "on_cancel":"electrical_contracting.electrical_contracting.doctype.timesheet.timesheet_custom.on_timesheet_on_cancel"
    },
    "Activity Planner":{
        "on_cancel":"electrical_contracting.electrical_contracting.doctype.activity_planner.activity_planner.activity_planner_on_cancel"
    }


    
 }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"electrical_contracting.tasks.all"
# 	],
# 	"daily": [
# 		"electrical_contracting.tasks.daily"
# 	],
# 	"hourly": [
# 		"electrical_contracting.tasks.hourly"
# 	],
# 	"weekly": [
# 		"electrical_contracting.tasks.weekly"
# 	]
# 	"monthly": [
# 		"electrical_contracting.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "electrical_contracting.install.before_tests"

# Overriding Whitelisted Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "electrical_contracting.event.get_events"
# }
fixtures = ["Custom Field"]
