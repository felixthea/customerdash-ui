var API_BASE = 'http://localhost:3000';

console.log("in background");

chrome.extension.onMessage.addListener(function(request, sender, sendResponse){

	requestMap = {
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
		var customerEmail = msg.customer;

		retrieveCustomer(customerEmail)
		.done(function(data){
			port.postMessage(data);
		})
	})
})

function retrieveCustomer(customerEmail){
	return $.get(
		API_BASE + "/customers/show", 
		{ 
			"session_token": savedSessionToken(),
			"customer_email": customerEmail
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