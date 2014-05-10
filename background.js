var API_BASE = 'http://localhost:3000';

console.log("in background");

chrome.extension.onMessage.addListener(function(request, sender, sendResponse){

	var requestMap = {
		"login": function(){
			saveSessionToken(request.sessionToken);
			sendResponse({status: "successfully logged in"})
		},
		"logged_in?": function(){
			savedSessionToken() !== null ? sendResponse({log_in_status: true}) : sendResponse({log_in_status: false})
		},
		"logout": function(){
			removeSessionToken();
			sendResponse({status: "successfully logged out"})
		},
		"get_session_token": function(){
			sendResponse({session_token: savedSessionToken()});
		}
	}

	requestMap[request.type]();
})

chrome.runtime.onConnect.addListener(function(port){
	port.onMessage.addListener(function(msg){

		var requestMap = {
			"retrieve_customer": function(){
				retrieveShopifyCustomer(msg.customerEmail)
				.done(function(customer){
					port.postMessage(customer);
				})
			},
			"retrieve_customer_with_orders": function(){

				retrieveShopifyCustomer(msg.customerEmail)

				.done(function(customer){

					if (customer.status === 422) { 
						port.postMessage({customer: undefined})
					} else {
						retrieveShopifyOrderIndex(customer.id)

						.done(function(orders){
							port.postMessage({customer: customer, orders: orders});
						});
					}
				})
			}
		}

		requestMap[msg.type]();
	})
})

function retrieveStripeCustomer(customerEmail){
	return $.get(
		API_BASE + "/customers/stripe/show", 
		{ 
			"session_token": savedSessionToken(),
			"customer_email": customerEmail
		}
	)
};

function retrieveStripeOrderIndex(customerId){
	return $.get(
		API_BASE + '/orders/stripe/index',
		{
			"session_token": savedSessionToken(),
			"customer_id": customerId
		}
	)
};

function retrieveShopifyCustomer(customerEmail){
	return $.get(
		API_BASE + "/customers/shopify/show",
		{
			"session_token": savedSessionToken(),
			"customer_email": customerEmail
		}
	)
};

function retrieveShopifyOrderIndex(customerId){
	return $.get(
		API_BASE + '/orders/shopify/index',
		{
			"session_token": savedSessionToken(),
			"customer_id": customerId
		}
	)
};

function saveSessionToken(sessionToken){
  window.localStorage.setItem('stripe-simple-cs', sessionToken)
};

function removeSessionToken() {
	window.localStorage.removeItem('stripe-simple-cs');
}

function savedSessionToken(){
  return window.localStorage.getItem('stripe-simple-cs');
};