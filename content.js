$(document).ready(function(){
	$customerDashboard = $(
		"<div id='customer-dashboard'> \
			<div id='cd-header'><h1>Customer Dash</h1></div> \
			<div id='cd-body' class='hidden'> \
				<form id='query-customer'> \
					<input type='text' id='customer-email'> \
					<input type='submit' value='Lookup Customer'><span id='loading-icon' class='hidden'><img src='" + chrome.extension.getURL('ajax-loader.gif') + "'></span>\
				</form> \
				<div id='customer-info'><h2>Customer Info</h2><div id='customer-info-body'></div></div> \
				<div id='customer-charges'><h2>Customer Charges</h2><div id='customer-charges-body'></div></div> \
			</div> \
		</div>"
	)

	$('body').prepend($customerDashboard);

	var port = chrome.runtime.connect({name: "knock"});

	$('#cd-body').on('submit', 'form#query-customer', function(event){
		event.preventDefault();

		$('div#customer-info-body').html("");
		$('div#customer-charges-body').html("");
		$('#loading-icon').removeClass('hidden');

		var customerEmail = $('input#customer-email').val();
		
		port.postMessage({type: "retrieve_customer_with_orders", customerEmail: customerEmail});
		port.onMessage.addListener(function(data){

			$('#loading-icon').addClass('hidden');

			if(data.customer !== undefined) {
				var $customerInfoUl = createCustomerInfo(data.customer);
				var $chargesInfoUl = createChargesInfo(data.charges);

				updateBody({customer: $customerInfoUl, charges: $chargesInfoUl});
			} else {
				updateBody({customer: "No customer found", charges: "No charges found."});
			}
		});
	});

	function updateBody(obj){
		$('#customer-info-body').html(obj.customer);
		$('#customer-charges-body').html(obj.charges);
	};

	function createCustomerInfo(customer) {
		console.log(customer);
		var customerDate = new Date(customer.created_at);
		var email = "<td class='info-title'>Email:</td><td>" + customer.email + "</td>";
		var created = "<td class='info-title'>Created:</td><td>" + customerDate.toDateString() + "</td>";
		var note = "<td class='info-title'>Note:</td><td>" + customer.note + "</td>";

		var $table = $('<table id="customer-info-list"></table>');

		$.each([email, created, note], function(idx, val){
			$table.append($('<tr>' + val + '</tr>'));
		});

		return $table;
	};

	function createChargesInfo(charges) {
		console.log(charges);
		var $div = $('<div id="charges"></div>');

		$.each(charges, function(idx, charge){
			var $table = createChargeInfo(charge);
			$div.append($table);
		})

		return $div;
	};

	function createChargeInfo(charge) {
		var chargeDate = new Date(charge.created_at);
		var id = "<td class='info-title'>ID:</td><td>" + charge.id + "</td>";
		var created = "<td class='info-title'>Date:</td><td>" + chargeDate.toDateString() + "</td>";
		var subtotal_price = "<td class='info-title'>Subtotal:</td><td>$" + charge.subtotal_price + "</td>";
		var total_price = "<td class='info-title'>Total:</td><td>$" + charge.total_price + "</td>";
		var lineItems = "<td class='info-title'>Items:</td><td>" + $.map(charge.line_items, function(item, idx) { return item.name; }).join(", ") + "</td>";

		var $table = $("<table class='charge-info-list'></table>");

		$.each([id, created, subtotal_price, total_price, lineItems], function(idx, val){
			var $row = $("<tr>" + val + "</tr>");
			$table.append($row);
		});

		return $table;
	}

	$('#cd-header').on('click', function(event){
		$('#cd-body').toggleClass('hidden');
	})
	
})