frappe.ui.form.on('Sales Order Item', {
    item_code: function(frm,cdt,cdn){
        var d = locals[cdt][cdn];
        var item_code = d.item_code;
        frappe.call({
            method:"frappe.client.get_value",
            args: {
                doctype:"BOM",
                filters: {
                    item: item_code,
                    is_default : 1

                },
                fieldname:["name","stock_material_cost","activity_material_cost"]
            }, 
            callback: function(r) { 
                frappe.model.set_value(d.doctype, d.name,"bom_no",r.message.name)
                frappe.model.set_value(d.doctype, d.name,"stock_material_cost",r.message.stock_material_cost)
                frappe.model.set_value(d.doctype, d.name,"activity_material_cost",r.message.activity_material_cost)
                var rate = 0;
                var activity_rate = 0;
                var material_overhead = 0;
                var activity_overhead = 0;
                material_overhead = flt(d.stock_material_cost)*(flt(d.material_overhead)/100);
                frappe.model.set_value(d.doctype, d.name,"material_overhead_amount",material_overhead)
                activity_overhead = flt(d.activity_material_cost)*(flt(d.activity_overhead)/100);
                frappe.model.set_value(d.doctype, d.name,"activity_overhead_amount",activity_overhead)
                var amount =flt(d.stock_material_cost)+flt(d.material_overhead_amount);
                rate =flt(amount)*(flt(d.margin)/100);
                frappe.model.set_value(d.doctype, d.name,"margin_rate_of_stock_items",rate)
                var amount =flt(d.activity_material_cost)+flt(d.activity_overhead_amount);
                activity_rate = flt(amount)*(flt(d.margin_of_activity_items)/100);
                frappe.model.set_value(d.doctype, d.name,"margin_rate_of_activity_items",activity_rate)
            }
        })
     },
activity_material_cost:function(frm,cdt,cdn)
{
    var d = locals[cdt][cdn];
    var total_rate =d.activity_material_cost;
    frappe.model.set_value(d.doctype, d.name,"rate_with_margin_of_activity_items",total_rate)
},
stock_material_cost:function(frm,cdt,cdn)
{
    var d = locals[cdt][cdn];
    var total_rate =d.stock_material_cost;
    frappe.model.set_value(d.doctype, d.name,"rate_with_margin_of_stock_items",total_rate)
},
     margin: function(frm,cdt,cdn) {
        var d = locals[cdt][cdn];
        var rate = 0;
        var amount =flt(d.stock_material_cost)+flt(d.material_overhead_amount);
        rate = flt(amount)*(flt(d.margin)/100);
        frappe.model.set_value(d.doctype, d.name,"margin_rate_of_stock_items",rate)
    },
    material_overhead: function(frm,cdt,cdn) {
        var d = locals[cdt][cdn];
        var material_overhead = 0;
        var total_rate =0;
        var margin = 0;
        var rate = 0;
        material_overhead = flt(d.stock_material_cost)*(flt(d.material_overhead)/100);
        frappe.model.set_value(d.doctype, d.name,"material_overhead_amount",material_overhead)
        if(d.margin != 0)
        {
        var amount =flt(d.stock_material_cost)+flt(d.material_overhead_amount);
        rate = flt(amount)*(flt(d.margin)/100);
        frappe.model.set_value(d.doctype, d.name,"margin_rate_of_stock_items",rate)
        }
        var total_rate =0;
        var total_rate1 =0;
        total_rate =d.stock_material_cost + d.margin_rate_of_stock_items +d.material_overhead_amount;
        frappe.model.set_value(d.doctype, d.name,"rate_with_margin_of_stock_items",total_rate)
        total_rate1 = d.margin_rate_of_stock_items +d.margin_rate_of_activity_items+d.material_overhead_amount+d.activity_overhead_amount;
        frappe.model.set_value(d.doctype, d.name,"margin_rate_or_amount",total_rate1)
    },
    activity_overhead: function(frm,cdt,cdn) {
        var d = locals[cdt][cdn];
        var activity_overhead = 0;
        activity_overhead = flt(d.activity_material_cost)*(flt(d.activity_overhead)/100);
        frappe.model.set_value(d.doctype, d.name,"activity_overhead_amount",activity_overhead)
        if(d.margin_of_activity_items != 0)
        {
        var amount =flt(d.activity_material_cost)+flt(d.activity_overhead_amount);
        var rate = flt(amount)*(flt(d.margin_of_activity_items)/100);
        frappe.model.set_value(d.doctype, d.name,"margin_rate_of_activity_items",rate)
        }
        var total_rate =d.activity_material_cost + d.margin_rate_of_activity_items +d.activity_overhead_amount;
        frappe.model.set_value(d.doctype, d.name,"rate_with_margin_of_activity_items",total_rate)
        var total_rate1 = d.margin_rate_of_stock_items +d.margin_rate_of_activity_items+d.activity_overhead_amount+d.material_overhead_amount;
        frappe.model.set_value(d.doctype, d.name,"margin_rate_or_amount",total_rate1)
        
    },
  
    margin_rate_of_stock_items: function(frm,cdt,cdn) {
        var d = locals[cdt][cdn];
        var rate = 0;
        var total_rate =0;
        var total_rate1 =0;
        total_rate =d.stock_material_cost + d.margin_rate_of_stock_items +d.material_overhead_amount;
        frappe.model.set_value(d.doctype, d.name,"rate_with_margin_of_stock_items",total_rate)
        total_rate1 = d.margin_rate_of_stock_items +d.margin_rate_of_activity_items+d.material_overhead_amount+d.activity_overhead_amount;
        frappe.model.set_value(d.doctype, d.name,"margin_rate_or_amount",total_rate1)
        
    },
    margin_of_activity_items: function(frm,cdt,cdn) {
        var d = locals[cdt][cdn];
        var activity_rate = 0;
        var amount =flt(d.activity_material_cost)+flt(d.activity_overhead_amount);
        activity_rate = flt(amount)*(flt(d.margin_of_activity_items)/100);
        frappe.model.set_value(d.doctype, d.name,"margin_rate_of_activity_items",activity_rate)
    },
    margin_rate_of_activity_items: function(frm,cdt,cdn) {
        var d = locals[cdt][cdn];
        var rate = 0;
        var total_rate =0;
        var total_rate1 =0;
         total_rate =d.activity_material_cost + d.margin_rate_of_activity_items +d.activity_overhead_amount;
        frappe.model.set_value(d.doctype, d.name,"rate_with_margin_of_activity_items",total_rate)
        total_rate1 = d.margin_rate_of_stock_items +d.margin_rate_of_activity_items+d.activity_overhead_amount+d.material_overhead_amount;
        frappe.model.set_value(d.doctype, d.name,"margin_rate_or_amount",total_rate1)
    }   
});
frappe.ui.form.on("Sales Order", {
    onload:function(frm,cdt,cdn){
		var d =locals[cdt][cdn]
            frm.set_query("customer", function() {
                return {
                    filters: [
						["Customer","docstatus", "=", 1]  
						//["is_group","=",1]
                    ]
                }
            });
            frm.refresh_field("customer");
		
    }, 
    onload:function(frm)
    {
        $("Button[data-fieldname=apply_defaults]").addClass("btn-primary");
    },   
    /*refresh:function(frm){   
        cur_frm.fields_dict.default_stock_item_discount.$input.on("click", function(evt){  
            var a=frm.doc.default_stock_item_discount;
                cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
                cur_frm.fields_dict.apply_changed_defaults.$input.on("click", function(evt){
                $.each(frm.doc.items || [], function(i, v) {
                    if(a==v.margin)
                    {
                        frappe.model.set_value(v.doctype, v.name,"margin",frm.doc.default_stock_item_discount)
                        cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
                    }
                })
                })   
        })
    if(frm.doc.default_activity_item_discount!=0)
    {
        cur_frm.fields_dict.default_activity_item_discount.$input.on("click", function(evt){
            var a=frm.doc.default_activity_item_discount;
            cur_frm.set_df_property("apply_changed_defaults", "hidden", Tr);
            cur_frm.fields_dict.apply_changed_defaults.$input.on("click", function(evt){
                $.each(frm.doc.items || [], function(i, v) {
                    if(a==v.margin_of_activity_items)
                    {
                        frappe.model.set_value(v.doctype, v.name,"margin_of_activity_items",frm.doc.default_activity_item_discount)
                       
                        cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
                    }
                })
            })   
    })
}
if(frm.doc.default_activity_item_discount!=0)
    {
    cur_frm.fields_dict.default_activity_overhead.$input.on("click", function(evt){
        var a=frm.doc.default_activity_overhead;
        cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
        cur_frm.fields_dict.apply_changed_defaults.$input.on("click", function(evt){
            $.each(frm.doc.items || [], function(i, v) {
                if(a==v.activity_overhead)
                {
    
                    frappe.model.set_value(v.doctype, v.name,"activity_overhead",frm.doc.default_activity_overhead)
                    cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
                }
            })
        })
    
    }) 
}
if(frm.doc.default_activity_item_discount!=0)
    {
    cur_frm.fields_dict.default_material_overhead.$input.on("click", function(evt){
        var a=frm.doc.default_material_overhead;
        cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
        cur_frm.fields_dict.apply_changed_defaults.$input.on("click", function(evt){
            $.each(frm.doc.items || [], function(i, v) {
                if(a==v.material_overhead)
                {
                    frappe.model.set_value(v.doctype, v.name,"material_overhead",frm.doc.default_material_overhead)
                    cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
                }
            })
        })
    
})
    }

       
    },*/
    default_margin: function(frm) {
        $.each(frm.doc.items || [], function(i, v) {
            frappe.model.set_value(v.doctype, v.name,"margin_rate_or_amount",frm.doc.default_margin)
        })
    },
    
validate:function(frm) {
        var total_price_list_rate = 0;
        var total_margin_amount = 0;
        $.each(frm.doc.items || [], function(i, d) {
        total_price_list_rate+= flt(d.price_list_rate) * flt(d.qty);
    });
    frm.set_value("total_margin_amount",frm.doc.total - total_price_list_rate);
    frm.set_value("total_price_list_rate", total_price_list_rate);
        var total_Material_cost= 0;
        var total_activity_cost = 0;
        var total_activity_margin_amount = 0;
        var total_Material_margin_amount = 0;
        var total_Material_with_margin = 0;
        var total_activity_with_margin= 0;
        var activity_cost = 0;
        var total_material_overhead =0;
        var  total_activity_overhead =0;
        var total_overhead_amount =0;
        $.each(frm.doc.items || [], function(i, v) {
            total_Material_cost = total_Material_cost + v.stock_material_cost
            total_activity_cost = total_activity_cost + v.activity_material_cost 
            total_Material_margin_amount = total_Material_margin_amount + v.margin_rate_of_stock_items 
            total_activity_margin_amount = total_activity_margin_amount + v.margin_rate_of_activity_items
            total_Material_with_margin = total_Material_with_margin + v.rate_with_margin_of_stock_items
            total_activity_with_margin = total_activity_with_margin + v.rate_with_margin_of_activity_items
            total_material_overhead     = total_material_overhead + v.material_overhead_amount
            total_activity_overhead     = total_activity_overhead + v.activity_overhead_amount
        })
       
        frm.set_value("total_material_cost",total_Material_cost);
        frm.set_value("total_activity_cost",total_activity_cost);
        frm.set_value("total_material_margin_amount",total_Material_margin_amount);
        frm.set_value("total_activity_margin_amount",total_activity_margin_amount);
        frm.set_value("total_material_with_margin",total_Material_with_margin);
        frm.set_value("total_activity_with_margin",total_activity_with_margin);
        frm.set_value("total_material_overhead",total_material_overhead);
        frm.set_value("total_activity_overhead",total_activity_overhead);
        total_overhead_amount =frm.doc.total_material_overhead +frm.doc.total_activity_overhead;
        frm.set_value("total_overhead_amount",total_overhead_amount);
    },
    
default_stock_item_discount: function(frm) {
    
        cur_frm.fields_dict.apply_defaults.$input.on("click", function(evt){
        $.each(frm.doc.items || [], function(i, v) {
            frappe.model.set_value(v.doctype, v.name,"margin",frm.doc.default_stock_item_discount)
            frappe.model.set_value(v.doctype, v.name,"margin_of_activity_items",frm.doc.default_activity_item_discount)
            frappe.model.set_value(v.doctype, v.name,"activity_overhead",frm.doc.default_activity_overhead)
            frappe.model.set_value(v.doctype, v.name,"material_overhead",frm.doc.default_material_overhead)
        })
    }) 
    
        cur_frm.fields_dict.default_stock_item_discount.$input.on("click", function(evt){
            var a=frm.doc.default_stock_item_discount;
            cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
            cur_frm.fields_dict.apply_changed_defaults.$input.on("click", function(evt){
            $.each(frm.doc.items || [], function(i, v) {
                if(a==v.margin)
                {
                    frappe.model.set_value(v.doctype, v.name,"margin",frm.doc.default_stock_item_discount)
                    cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
                }
            })
            })
           
            
        })    
        
 },
 default_activity_item_discount: function(frm) {
    cur_frm.fields_dict.apply_defaults.$input.on("click", function(evt){
        $.each(frm.doc.items || [], function(i, v) {
        frappe.model.set_value(v.doctype, v.name,"margin",frm.doc.default_stock_item_discount)
        frappe.model.set_value(v.doctype, v.name,"margin_of_activity_items",frm.doc.default_activity_item_discount)
        frappe.model.set_value(v.doctype, v.name,"activity_overhead",frm.doc.default_activity_overhead)
        frappe.model.set_value(v.doctype, v.name,"material_overhead",frm.doc.default_material_overhead)
        })
    })
    cur_frm.fields_dict.default_activity_item_discount.$input.on("click", function(evt){
        var a=frm.doc.default_activity_item_discount;
        cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
        cur_frm.fields_dict.apply_changed_defaults.$input.on("click", function(evt){
            $.each(frm.doc.items || [], function(i, v) {
                if(a==v.margin_of_activity_items)
                {
                    frappe.model.set_value(v.doctype, v.name,"margin_of_activity_items",frm.doc.default_activity_item_discount)
                    cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
                }
            })
        })   
})
},
default_activity_overhead: function(frm) {
    cur_frm.fields_dict.apply_defaults.$input.on("click", function(evt){
        $.each(frm.doc.items || [], function(i, v) {
        frappe.model.set_value(v.doctype, v.name,"margin",frm.doc.default_stock_item_discount)
        frappe.model.set_value(v.doctype, v.name,"margin_of_activity_items",frm.doc.default_activity_item_discount)
        frappe.model.set_value(v.doctype, v.name,"activity_overhead",frm.doc.default_activity_overhead)
        frappe.model.set_value(v.doctype, v.name,"material_overhead",frm.doc.default_material_overhead)
        })
    })
    cur_frm.fields_dict.default_activity_overhead.$input.on("click", function(evt){
        var a=frm.doc.default_activity_overhead;
        cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
        cur_frm.fields_dict.apply_changed_defaults.$input.on("click", function(evt){
            $.each(frm.doc.items || [], function(i, v) {
                if(a==v.activity_overhead)
                {
                    frappe.model.set_value(v.doctype, v.name,"activity_overhead",frm.doc.default_activity_overhead)
                    cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
                }
            })
        })
    
    }) 
},
default_material_overhead: function(frm) {
    cur_frm.fields_dict.apply_defaults.$input.on("click", function(evt){
        $.each(frm.doc.items || [], function(i, v) {
        frappe.model.set_value(v.doctype, v.name,"margin",frm.doc.default_stock_item_discount)
        frappe.model.set_value(v.doctype, v.name,"margin_of_activity_items",frm.doc.default_activity_item_discount)
        frappe.model.set_value(v.doctype, v.name,"activity_overhead",frm.doc.default_activity_overhead)
        frappe.model.set_value(v.doctype, v.name,"material_overhead",frm.doc.default_material_overhead)
        })
    })
    cur_frm.fields_dict.default_material_overhead.$input.on("click", function(evt){
        var a=frm.doc.default_material_overhead;
        cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
        cur_frm.fields_dict.apply_changed_defaults.$input.on("click", function(evt){
            $.each(frm.doc.items || [], function(i, v) {
                if(a==v.material_overhead)
                {
                    frappe.model.set_value(v.doctype, v.name,"material_overhead",frm.doc.default_material_overhead)
                    cur_frm.set_df_property("apply_changed_defaults", "hidden", true);
                }
            })
        })
    
})
},
});