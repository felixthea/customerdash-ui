// var API_BASE = 'https://www.emailinboxcrm.com';
var API_BASE = 'http://localhost:3000'

chrome.runtime.onMessage.addListener(
  function(msg, sender, sendResponse) {
  	var requestMap = {
			"retrieve_customer_by_email_with_orders": function(){
				retrieveShopifyCustomerAndOrdersByEmail(msg.customerEmail)
				.done(function(data){
					if (data.status === 422){
						sendResponse({customer: undefined});
					} else {
						sendResponse({customer: data.customer, orders: data.orders});
					}
				})
			},
			"retrieve_customer_by_full_name": function(){
				retrieveShopifyCustomerByFullName(msg.firstName, msg.lastName)
				.done(function(customers){
					if (customers.status === 422) {
						sendResponse({customers: undefined});
					} else {
						sendResponse({customers: customers});
					}
				})
			},
			"retrieve_customer_with_orders_by_order_num": function(){
				retrieveShopifyCustomerAndOrdersByOrderNum(msg.orderNum)
				.done(function(data){
					if (data.status === 422) {
						sendResponse({customer: undefined});
					} else {
						sendResponse({customer: data.customer, orders: data.orders}) // @todo: sending both customer and orders but consumer doesn't expect orders
					}
				})
			},
			"login": function(){
				saveSessionToken(msg.sessionToken);
				sendResponse({status: "successfully logged in"})
			},
			"logged_in?": function(){
				if (savedSessionToken() !== null) {
					getUserStatus()
					.done(function(response){
						sendResponse({
							log_in_status: true,
							trial_days_left: response.trial_days_left,
							good_standing: response.good_standing
						})
					})
				} else {
					sendResponse({log_in_status: false})
				}
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
			},
			"update_customer": function(){
				updateShopifyCustomer(msg.customerId, msg.newParams)
				.done(function(order){
					sendResponse(order);
				})
			}
		};

  	requestMap[msg.type]()
  	return true;
  }
);

function retrieveShopifyCustomerAndOrdersByEmail(email){
	return $.get(
		API_BASE + "/orders/shopify/by_email",
		{
			"session_token": savedSessionToken(),
			"email": email
		}
	)
}

function retrieveShopifyCustomerByFullName(firstName, lastName){
	return $.get(
		API_BASE + "/customers/shopify/by_name",
		{
			"session_token": savedSessionToken(),
			"first_name": firstName,
			"last_name": lastName
		}
	)
};

function retrieveShopifyCustomerByOrderNum(orderNum){
	return $.get(
		API_BASE + "/customers/shopify/by_order_num",
		{
			"session_token": savedSessionToken(),
			"order_num": orderNum
		}
	)
}

function retrieveShopifyCustomerAndOrdersByOrderNum(orderNum){
	return $.get(
		API_BASE + "/orders/shopify/by_order_num",
		{
			"session_token": savedSessionToken(),
			"order_num": orderNum
		}
	)
}

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

function updateShopifyCustomer(customerId, newParams){
	return $.post(
		API_BASE + '/customers/shopify/update',
		{
			"session_token": savedSessionToken(),
			"customer_id": customerId,
			"new_params": newParams
		}
	)
};

function getUserStatus() {
	return $.get(
		API_BASE + '/users/status',
		{
			"session_token": savedSessionToken()
		}
	)
}

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