frappe.ui.form.on('Quotation Item', {
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
                // set the returned value in a field
                frappe.model.set_value(d.doctype, d.name,"bom_no",r.message.name)
                frappe.model.set_value(d.doctype, d.name,"stock_material_cost",r.message.stock_material_cost)
                frappe.model.set_value(d.doctype, d.name,"activity_material_cost",r.message.activity_material_cost)
            }
        })
     },
     margin: function(frm,cdt,cdn) {
        var d = locals[cdt][cdn];
        var rate = 0;
        rate = flt(d.stock_material_cost)*(flt(d.margin)/100);
        frappe.model.set_value(d.doctype, d.name,"margin_rate_of_stock_items",rate)
    },
    margin_rate_of_stock_items: function(frm,cdt,cdn) {
        var d = locals[cdt][cdn];
        var rate = 0;
        var total_rate =0;
        var total_rate1 =0;
        rate = (flt(d.margin_rate_of_stock_items)/flt(d.stock_material_cost))*100;
        frappe.model.set_value(d.doctype, d.name,"margin",rate)
         total_rate =d.stock_material_cost + d.margin_rate_of_stock_items;
        frappe.model.set_value(d.doctype, d.name,"rate_with_margin_of_stock_items",total_rate)
        total_rate1 = d.margin_rate_of_stock_items +d.margin_rate_of_activity_items;
        frappe.model.set_value(d.doctype, d.name,"margin_rate_or_amount",total_rate1)
        
    },
    margin_of_activity_items: function(frm,cdt,cdn) {
        var d = locals[cdt][cdn];
        var rate = 0;
        var total_rate = 0;
        rate = flt(d.activity_material_cost)*(flt(d.margin_of_activity_items)/100);
        frappe.model.set_value(d.doctype, d.name,"margin_rate_of_activity_items",rate)
       
    },
    margin_rate_of_activity_items: function(frm,cdt,cdn) {
        var d = locals[cdt][cdn];
        var rate = 0;
        var total_rate =0;
        var total_rate1 =0;
        rate = (flt(d.margin_rate_of_activity_items)/flt(d.activity_material_cost))*100;
        frappe.model.set_value(d.doctype, d.name,"margin_of_activity_items",rate)
         total_rate =d.activity_material_cost + d.margin_rate_of_activity_items;
        frappe.model.set_value(d.doctype, d.name,"rate_with_margin_of_activity_items",total_rate)
        total_rate1 = d.margin_rate_of_stock_items +d.margin_rate_of_activity_items;
        frappe.model.set_value(d.doctype, d.name,"margin_rate_or_amount",total_rate1)
    }
  /*   discount_on_stock_item: function(frm,cdt,cdn){
        var d = locals[cdt][cdn];
        var bom_no = d.bom_no;
        frappe.call({
            method:"electrical_contracting.electrical_contracting.doctype.quotation.quotation_custom.get_bom_items",
            args:{"bom" : bom_no},
            callback: function(r) {
               
                if (!r.exc) {
                    var stock_rate = 0;
                    var activity_rate = 0;
                    var stock_rate_discount = 0;
                    var activity_rate_discount =0;
                    for (var i=0; i<r.message.length; i++)
                    {
                        var item = r.message[i];
                        if(item.is_stock_item == 1)
                        {
                            stock_rate += item.amount;
                           
                        }
                       
                       
                      stock_rate_discount = flt(stock_rate)*(flt(d.discount_on_stock_item)/100);
                                     

                    }
                
                frappe.model.set_value(d.doctype, d.name,"stock_item_rate",stock_rate_discount)
                
            
                 }
        
                // set the returned value in a field
               // frappe.model.set_value(d.doctype, d.name,"bom_no",r.message.name)
            
        }
        })
     },
     
     discount_on_activity_items: function(frm,cdt,cdn){
        var d = locals[cdt][cdn];
        var bom_no = d.bom_no;
        frappe.call({
            method:"electrical_contracting.electrical_contracting.doctype.quotation.quotation_custom.get_bom_activity",
            args:{"bom" : bom_no},
            callback: function(r) {
                if (!r.exc) {
                    var activity_rate = 0;
                    var activity_rate_discount =0;
                    for (var i=0; i<r.message.length; i++)
                    {
                        var item = r.message[i];
                        if(item.is_stock_item != 1)
                        {
                            activity_rate +=item.amount;                         
                        }
                      activity_rate_discount =flt(activity_rate)*(flt(d.discount_on_activity_items)/100);

                    }
                frappe.model.set_value(d.doctype, d.name,"activity_item_rtae",activity_rate_discount)
        
                // set the returned value in a field
               // frappe.model.set_value(d.doctype, d.name,"bom_no",r.message.name)
            }
        }
        })
     },
     stock_item_rate: function(frm,cdt,cdn){
        var d = locals[cdt][cdn];
        var rate = d.stock_item_rate;
        var act_rate = d.activity_item_rtae;
        var disc_rate = 0;
        disc_rate = rate +act_rate;
        frappe.model.set_value(d.doctype, d.name,"discount_rate",disc_rate)
        frappe.model.set_value(d.doctype, d.name,"discount_amount",disc_rate)
     },
     activity_item_rtae: function(frm,cdt,cdn){
        var d = locals[cdt][cdn];
        var rate = d.stock_item_rate;
        var act_rate = d.activity_item_rtae;
        var disc_rate = 0;
        disc_rate = rate +act_rate;
        frappe.model.set_value(d.doctype, d.name,"discount_rate",disc_rate)
        frappe.model.set_value(d.doctype, d.name,"discount_amount",disc_rate)
     },*/
     
});
frappe.ui.form.on("Quotation", {
    default_stock_item_discount: function(frm) {
        //if(frm.doc.items.length >1) 
         //{
             msgprint('default_stock_item_discount');
            $.each(frm.doc.items || [], function(i, v)
            {
               frappe.model.set_value(v.doctype, v.name,"margin",frm.doc.default_stock_item_discount)
               
           }) 
         //}
        // else
        // {
           // msgprint({message: 'Please select Item from Table', title: __('Message'), indicator:'blue'})
           // frm.refresh_field("default_stock_item_discount");
         //}
 },
 default_activity_item_discount: function(frm) {
    msgprint('default_activity_item_discount');
    $.each(frm.doc.items || [], function(i, v) {
        frappe.model.set_value(v.doctype, v.name,"margin_of_activity_items",frm.doc.default_activity_item_discount)
    })
    /*if(frm.doc.items.length >1) 
    {
        
    
    }
    else
    {
   msgprint({message: 'Please select Item from Table', title: __('Message'), indicator:'blue'})
   frm.refresh_field("default_activity_item_discount");
    }*/
}
});