# -*- coding: utf-8 -*-
# Copyright (c) 2020, momscode and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class ProjectDiscount(Document):
	def create_bom_from_project_discount(self):
#		this function currently not using (this function is made for creating new boms with new project discount)
		bom_list = frappe.db.sql("""select name 
			from `tabBOM`
			where project_discount = %s and project = %s and is_default = 1 
			and docstatus= 1""",(self.name,self.project),as_dict=1)

		for b in bom_list:
			bom = frappe.new_doc('BOM')
			bom.flags.ignore_permissions  = True
			data = frappe.get_all("BOM", fields = ["*"],filters = {'name' : b.name, 'project':self.project})
			bom_name = data[0]['name']
			bom.allow_same_item_multiple_times = data[0]['allow_same_item_multiple_times']
			bom.image = data[0]['image']
			bom.website_image = data[0]['website_image']
			bom.currency = data[0]['currency']
			bom.conversion_rate = data[0]['conversion_rate']
			bom.total_cost = data[0]['total_cost']
			bom.allow_alternative_item = data[0]['allow_alternative_item']
			bom.base_operating_cost = data[0]['base_operating_cost']
			bom.project = data[0]['project']
			bom.inspection_required = data[0]['inspection_required']
			bom.base_raw_material_cost = data[0]['base_raw_material_cost']
			bom.item_name = data[0]['item_name']
			bom.base_scrap_material_cost = data[0]['base_scrap_material_cost']
			bom.buying_price_list = data[0]['buying_price_list']
			bom.uom = data[0]['uom']
			bom.routing = data[0]['routing']
			bom.description = data[0]['description']
			bom.raw_material_cost = data[0]['raw_material_cost']
			bom.company = data[0]['company']
			bom.with_operations = data[0]['with_operations']
			bom.transfer_material_against = data[0]['transfer_material_against']
			bom.show_operations = data[0]['show_operations']
			bom.rm_cost_as_per = data[0]['rm_cost_as_per']
			bom.route = data[0]['route']
			bom.set_rate_of_sub_assembly_item_based_on_bom = data[0]['set_rate_of_sub_assembly_item_based_on_bom']
			bom.show_items = data[0]['show_items']
			bom.item = data[0]['item']
			bom.web_long_description = data[0]['web_long_description']
			bom.quality_inspection_template = data[0]['quality_inspection_template']
			bom.base_total_cost = data[0]['base_total_cost']
			bom.quantity = data[0]['quantity']
			bom.type = data[0]['type']
			bom.project_discount = self.name
			bom_item_list = frappe.db.sql("""select bi.stock_qty,bi.qty_consumed_per_unit,bi.base_amount,bi.qty,
				bi.rate,bi.allow_alternative_item,bi.operation,bi.include_item_in_manufacturing,bi.item_name,
				bi.scrap,bi.stock_uom,bi.original_item,bi.image,bi.uom,bi.description,bi.conversion_factor,
				bi.base_rate,bi.item_code,bi.source_warehouse,bi.bom_no,bi.amount,bi.discount_percentage,
				bi.discount_rate
				from `tabBOM Item` bi, `tabBOM` b
				where b.name = bi.parent and bi.parenttype = 'BOM'
				and bi.docstatus = 1 and bi.parent = %s""",(bom_name), as_dict=1)

			bom_project_discount_list = frappe.db.sql("""select pd.project,pd.discount_percentage,pd.item_group 
				from `tabProject Discount Detail` pd, `tabBOM` b
				where b.name = pd.parent and pd.parenttype = 'BOM'
				and pd.docstatus = 1 and pd.parent = %s""",(bom_name),as_dict=1)

			project_discount_list = frappe.db.sql("""select pd.item_group,pd.discount_percentage,pd.project 
				from `tabProject Discount Detail` pd, `tabProject Discount` p
				where p.name = pd.parent and pd.parenttype = 'Project Discount'
				and pd.parent = %s""",(self.name), as_dict=1)

			total_discount_rate = 0

			for item in bom_item_list:
				item_group = frappe.db.get_value('Item', {'item_code': item.item_code, 'disabled': 0}, 'item_group')
				for pd in project_discount_list:
					if pd.item_group == item_group:
						if pd.discount_percentage != item.discount_percentage:
							item.discount_percentage = pd.discount_percentage
							item.discount_rate = item.amount * (item.discount_percentage/100)

				total_discount_rate = total_discount_rate + item.discount_rate
				frappe.msgprint(total_discount_rate)
				
				bom.append('items', {
					'stock_qty':item.stock_qty,
					'qty_consumed_per_unit':item.qty_consumed_per_unit,
					'base_amount':item.base_amount,
					'qty': item.qty,
					'rate': item.rate,
					'allow_alternative_item': item.allow_alternative_item,
					'operation': item.operation,
					'include_item_in_manufacturing': item.include_item_in_manufacturing,
					'item_name': item.item_name,
					'scrap': item.scrap,
					'stock_uom': item.stock_uom,
					'original_item': item.original_item,
					'image': item.image,
					'uom': item.uom,
					'description': item.description,
					'conversion_factor': item.conversion_factor,
					'base_rate': item.base_rate,
					'item_code': item.item_code,
					'source_warehouse': item.source_warehouse,
					'bom_no': item.bom_no,
					'amount': item.amount,
					'discount_percentage': item.discount_percentage,
					'discount_rate': item.discount_rate
				})

			bom.total_discount = total_discount_rate

			for pr in bom_project_discount_list:
				for pd in project_discount_list:
					if pr.item_group == pd.item_group:
						if pr.discount_percentage != pd.discount_percentage:
							pr.discount_percentage = pd.discount_percentage

				bom.append('bom_discount_detial',{
					'item_group': pr.item_group,
					'discount_percentage': pr.discount_percentage,
					'project': pr.project
				})

			bom.flags.ignore_permissions  = True

			bom.update({'currency': bom.currency,
			'buying_price_list': bom.buying_price_list,
			'uom': bom.uom,
			'description': bom.description,
			'company': bom.company,
			'is_active': bom.is_active,
			'item': bom.item,
			'items': bom.items,
			'bom_discount_detial': bom.bom_discount_detial}).insert()

			return bom

def on_bom_on_save(doc, handler=""):
	if doc.opportunity:
		name = frappe.db.get_value('Project Discount', {'opportunity': doc.opportunity,'is_active': 1}, 'name')
		if name:
			for i in doc.bom_discount_detial:
				target_doc = frappe.get_doc('Project Discount', name)
				item_group = frappe.db.get_value('Project Discount Detail', {'opportunity': i.opportunity,'parent': name,'item_group': i.item_group}, 'item_group')
				if not item_group:
					target_doc.append('discount_detail', {
						'item_group': i.item_group,
						'opportunity': i.opportunity,
						'discount_percentage': i.discount_percentage,
					})
					target_doc.save()
					frappe.db.commit()
			return target_doc
		else:
			project_discount = frappe.new_doc('Project Discount')
			project_discount.flags.ignore_permissions  = True
			project_discount.update({'opportunity':doc.opportunity,'is_active': 1,'disabled':0,'discount_detail':doc.bom_discount_detial}).insert()
			return 	project_discount

def on_bom_on_change(doc, handler=""):
	if doc.opportunity:
		name = frappe.db.get_value('Project Discount', {'opportunity': doc.opportunity,'is_active':1}, 'name')
		if name:
			for i in doc.bom_discount_detial:
				target_doc = frappe.get_doc('Project Discount', name)
				item_group = frappe.db.get_value('Project Discount Detail', {'opportunity': i.opportunity,'parent': name,'item_group': i.item_group}, 'item_group')
				if not item_group:
					target_doc.append('discount_detail', {
						'item_group': i.item_group,
						'opportunity': i.opportunity,
						'discount_percentage': i.discount_percentage,
					})
					target_doc.save()
					frappe.db.commit()
				else:
    					frappe.db.sql("""update `tabProject Discount Detail` set discount_percentage = %s where item_group =%s""",(i.discount_percentage, i.item_group))
						#frappe.msgprint(msg = 'Item Price Updated',title ='Notification',indicator = 'green')
			return target_doc
		else:
			return 	

def before_insert(doc, hanler=""):
	if doc.opportunity:
		name = frappe.db.get_value('Project Discount', {'opportunity': doc.opportunity,'is_active':1}, 'name')
		if name:
			target_doc = frappe.get_doc('Project Discount', name)
			target_doc.is_active = 0
			target_doc.disabled = 1
			target_doc.save()
			frappe.db.commit()
			return target_doc
