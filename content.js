$(document).ready(function(){
	$customerDashboard = $(
		"<div id='customer-dashboard'> \
			<div id='cd-header'><h1>Customer Dash</h1></div> \
			<div id='cd-body' class='hidden'> \
				<input type='text' id='customer-email'> \
				<button id='query-customer'>Lookup Customer</button> \
				<span id='loading-icon' class='hidden'><img src='" + chrome.extension.getURL('ajax-loader.gif') + "'></span> \
				<div id='customer-info'><h2>Customer Info</h2><div id='customer-info-body'></div></div> \
				<div id='customer-charges'><h2>Customer Charges</h2><div id='customer-charges-body'></div></div> \
			</div> \
		</div>"
	)

	$('body').prepend($customerDashboard);

	var port = chrome.runtime.connect({name: "knock"});

	$('#cd-body').on('click', 'button#query-customer', function(event){
		event.preventDefault();

		$('div#customer-info-body').html("");
		$('div#customer-charges-body').html("");
		$('#loading-icon').removeClass('hidden');

		// var customerEmail = $('span[email]').attr('email');
		var customerEmail = $('input#customer-email').val();
		
		port.postMessage({type: "retrieve_customer_with_charges", customerEmail: customerEmail});
		port.onMessage.addListener(function(data){

			$('#loading-icon').addClass('hidden');

			if(data.customer !== undefined) {
				var $customerInfoUl = createCustomerInfo(data.customer);
				var $chargesInfoUl = createChargesInfo(data.charges.data);

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
		var email = "<span class='info-title'>Email:</span> " + customer.email;
		var created = "<span class='info-title'>Created:</span> " + Date(customer.created*1000);
		var discount = "<span class='info-title'>Discount:</span> " + customer.discount;
		var balance = "<span class='info-title'>Balance:</span> " + customer.balance;

		var $ul = $('<ul id="customer-info-list"></ul>');

		$.each([email, created, discount, balance], function(idx, val){
			$ul.append($('<li>' + val + '</li>'));
		});

		return $ul;
	};

	function createChargesInfo(charges) {
		var $div = $('<div id="charges"></div>');

		$.each(charges, function(idx, charge){
			var $ul = createChargeInfo(charge);
			$div.append($ul);
		})

		return $div;
	};

	function createChargeInfo(charge) {
		var id = "<span class='info-title'>ID:</span> " + charge.id;
		var created = "<span class='info-title'>Created:</span> " + Date(charge.created*1000);
		var paid = "<span class='info-title'>Paid:</span> " + charge.paid;
		var amount = "<span class='info-title'>Amount:</span> $" + charge.amount / 100.00;
		var currency = "<span class='info-title'>Currency:</span> " + charge.currency;
		var refunded = "<span class='info-title'>Refunded:</span> " + charge.refunded;

		var $ul = $("<ul class='charge-info-list'></ul>");

		$.each([id, created, paid, amount, currency, refunded], function(idx, val){
			var $li = $("<li>" + val + "</li>");
			$ul.append($li);
		});

		return $ul;
	}

	$('#cd-header').on('click', function(event){
		$('#cd-body').toggleClass('hidden');
	})
	
})