var API_BASE = 'http://localhost:3000';

console.log("in background");

chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
	if (request.type == "login") {
		saveSessionToken(request.sessionToken);
		sendResponse({status: "successfully logged in"})
	} else if (request.type == "logged_in?") {
		if (savedSessionToken() !== null) {
			sendResponse({log_in_status: true})
		} else {
			sendResponse({log_in_status: false})
		}
	} else if (request.type == "logout") {
		removeSessionToken();
		sendResponse({status: "successfully logged out"})
	} else if (request.type == "get_session_token") {
		sendResponse({session_token: savedSessionToken()});
	} else if (request.type == "get_customer_by_email") {
		sendResponse({customer: "Hello"})
		retrieveCustomer(request.email)
		.done(function(data){
			sendResponse({customer: data});
		})
	};
})

function retrieveCustomer(customerEmail){
  var request = $.ajax({
    type: "GET",
    url: API_BASE + "/customers/show",
    data: {
      "session_token": savedSessionToken(),
      "customer_email": customerEmail
    },
    success: function(data,status,jqXHR){
      console.log("console success");
    },
    error: function(jqXHR,textStatus,errorThrown){
      console.log("console error");
      console.log(jqXHR)
      console.log(textStatus)
      console.log(errorThrown)
    }
  })

  return request;
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