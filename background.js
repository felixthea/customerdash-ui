var API_BASE = 'http://localhost:3000';

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
					console.log(customer);
					if (customer.status === 422) { 
						sendResponse({customer: undefined});
					} else {
						retrieveShopifyOrderIndex(customer.id)
						.done(function(orders){
							sendResponse({customer: customer, orders: orders});
						});
					}
				})
			},
			"login": function(){
				saveSessionToken(msg.sessionToken);
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
			},
			"update_order": function(){
				updateShopifyOrder(msg.orderId, msg.newParams)
				.done(function(order){
					sendResponse(order);
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

function updateShopifyOrder(orderId, newParams){
	return $.post(
		API_BASE + '/orders/shopify/update',
		{
			"session_token": savedSessionToken(),
			"order_id": orderId,
			"new_params": newParams
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

chrome.browserAction.onClicked.addListener(function(tab){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {message: "toggle customer dash"}, function(response) {});  
	});
});