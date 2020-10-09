from __future__ import unicode_literals

from frappe import _


def get_data():
	return {
		'fieldname': 'activity_planner',
		'transactions': [
			{
				'label': _('Activity'),
				'items': ['Timesheet','Material Request']
			},
			
			
		]
	}