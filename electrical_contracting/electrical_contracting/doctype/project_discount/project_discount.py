# -*- coding: utf-8 -*-
# Copyright (c) 2020, momscode and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class ProjectDiscount(Document): pass

def on_bom_on_save(doc, handler=""):
	subject = frappe.db.get_value('Project Discount', {'project': doc.project}, 'name')
#	target_doc = frappe.get_doc('Project Discount', subject)
#	frappe.throw(("document {0}").format(target_doc))
	if subject:
		for i in doc.bom_discount_detial:
			target_doc = frappe.get_doc('Project Discount', subject)
			item_group = frappe.db.get_value('Project Discount Detail', {'project': i.project,'parent': subject,'item_group': i.item_group}, 'item_group')
			if not item_group:
#				frappe.throw(("item_group, project , discount percentage {0},{1},{2}").format(i.item_group,i.project,i.discount_percentage))
				target_doc.append('discount_detail', {
					'item_group': i.item_group,
					'project': i.project,
					'discount_percentage': i.discount_percentage,
				})
				target_doc.save()
				frappe.db.commit()
		return target_doc
	else:
		project_discount = frappe.new_doc('Project Discount')
		project_discount.flags.ignore_permissions  = True
		project_discount.update({'project':doc.project,'discount_detail':doc.bom_discount_detial}).insert()
		return 	project_discount

def on_bom_on_change(doc, handler=""):
	subject = frappe.db.get_value('Project Discount', {'project': doc.project}, 'name')
	if subject:
		for i in doc.bom_discount_detial:
			target_doc = frappe.get_doc('Project Discount', subject)
			item_group = frappe.db.get_value('Project Discount Detail', {'project': i.project,'parent': subject,'item_group': i.item_group}, 'item_group')
			if not item_group:
				target_doc.append('discount_detail', {
					'item_group': i.item_group,
					'project': i.project,
					'discount_percentage': i.discount_percentage,
				})
				target_doc.save()
				frappe.db.commit()
		return target_doc
	else:
		return 	

