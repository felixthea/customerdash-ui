$(document).ready(function(){
	$customerDashboard = $(
		"<div id='customer-dashboard'> \
			<div id='cd-header'><h1>Customer Dash</h1></div> \
			<div id='cd-body'> \
				<div id='customer-info'><h2>Customer Info</h2><div id='customer-info-body'></div></div> \
				<div id='customer-charges'><h2>Customer Charges</h2><div id='customer-charges-body'></div></div> \
			</div> \
		</div>"
	)

	$('body').prepend($customerDashboard);

	window.setTimeout(function(){
		var customerEmail = $('span[email]').attr('email');
		var port = chrome.runtime.connect({name: "knock"});

		port.postMessage({type: "retrieve_customer_with_charges", customerEmail: customerEmail});
		port.onMessage.addListener(function(data){
			var $ul = createCustomerInfo(data.customer);
			$('#customer-info-body').append($ul);
		});
	}, 3000);

	function createCustomerInfo(customer) {
		var email = "<span class='info-title'>Email:</span> " + customer.email;
		var created = "<span class='info-title'>Created:</span> " + Date(customer.created*1000);
		var discount = "<span class='info-title'>Discount:</span> " + customer.discount;
		var balance = "<span class='info-title'>Balance:</span> " + customer.balance;

		var $ul = $('<ul id="customer-info-list"></ul>');

		$.each([email, created, discount, balance], function(idx, val){
			$ul.append($('<li>' + val + '</li>'));
		})

		return $ul;
	};

	function createChargesInfo(charges) {

	};
	
})