$(document).ready(function(){
	$customerDashboard = $(
		"<div id='customer-dashboard'> \
			<h1>Customer Dashboard</h1> \
			<div id='customer-info'></div> \
		</div>"
	)
	$('body').prepend($customerDashboard);

	window.setTimeout(function(){
		var customerEmail = $('span[email]').attr('email');
		var port = chrome.runtime.connect({name: "knock"});

		port.postMessage({type: "retrieve_customer_with_charges", customerEmail: customerEmail});
		port.onMessage.addListener(function(data){
			// $('div#customer-info').html();
			console.log(data);
		});
	}, 3000);
	
})