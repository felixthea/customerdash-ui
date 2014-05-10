var API_BASE = 'http://localhost:3000';

console.log("in background");

chrome.runtime.onMessage.addListener(
  function(msg, sender, sendResponse) {
  	var requestMap = {
			"retrieve_customer": function(){
				retrieveShopifyCustomer(msg.customerEmail)
				.done(function(customer){
					sendResponse(customer);
				})
			},
			"retrieve_customer_with_orders": function(){
				retrieveShopifyCustomer(msg.customerEmail)
				.done(function(customer){
					if (customer.status === 422) { 
						sendResponse({customer: undefined});
					} else {
						retrieveShopifyOrderIndex(customer.id)
						.done(function(orders){
							sendResponse({customer: customer, orders: orders});
						});
					}

				})
			}
		};

  	requestMap[msg.type]()
  	return true;
  }
);

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