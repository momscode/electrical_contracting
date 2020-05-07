# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
            "label": _("Bill of Materials"),
			"items": [
				{
					"type": "doctype",
					"name": "Activity Item",
					"description": _("Activity Items And Price."),
				},
				{
					"type": "doctype",
					"name": "Project Discount",
					"description": _("Project Discount Details."),
				},
            ]
		}
	] 