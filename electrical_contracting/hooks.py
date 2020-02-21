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
    "Activity Cost" : "fixtures/custom_scripts/Activity Cost.js"
    }
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
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

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

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
fixtures = ["Custom Field","Custom Script"]
