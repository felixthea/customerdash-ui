var API_BASE = 'http://localhost:3000';
var savedSessionToken = savedSessionToken();

console.log("in background");

chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
	if (request.type == "login") {
		saveSessionToken(request.sessionToken);
		sendResponse({status: "successfully logged in"})
	}

	if (request.type == "logged_in?") {
		if (savedSessionToken !== null) {
			sendResponse({log_in_status: true})
		} else {
			sendResponse({log_in_status: false})
		}
	}
})

function retrieveCustomer(customerEmail){
  $.ajax({
    type: "GET",
    url: API_BASE + "/customers/show",
    data: {
      "session_token": savedSessionToken,
      "customer_email": customerEmail
    },
    success: function(data,status,jqXHR){
      console.log("console success");
      console.log(data);
    },
    error: function(jqXHR,textStatus,errorThrown){
      console.log("console error");
      console.log(jqXHR)
      console.log(textStatus)
      console.log(errorThrown)
    }
  })
};

function saveSessionToken(sessionToken){
  window.localStorage.setItem('stripe-simple-cs', sessionToken)
};

function savedSessionToken(){
  return window.localStorage.getItem('stripe-simple-cs');
};