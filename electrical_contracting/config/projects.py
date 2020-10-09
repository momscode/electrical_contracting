# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe.utils import add_days, cint, cstr, flt, getdate, rounded, date_diff, money_in_words
from frappe import _

def get_data():
    	return [
		{
			"label": _("Projects"),
			"icon": "fa fa-star",
			"items": [
				{
					"type": "doctype",
					"name": "Project Measurement",
					"description": _("Project Measurement"),
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Activity Planner",
					"description": _("Activity Planner"),
					"onboard": 1,
				},{
					"type": "doctype",
					"name": "Project Measurement",
					"description": _("Project Measurement"),
					"onboard": 1,
				},

            ]
		}
	] 