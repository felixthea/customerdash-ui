API_BASE = 'http://localhost:3000'

document.addEventListener('DOMContentLoaded', function () {
  var $logInForm = $('form#log-in');

  checkIfLoggedIn(function(loggedIn){
    if (loggedIn){
      $logInForm.addClass('hidden');
      $('button#log-out').removeClass('hidden');
    } else {
      $logInForm.removeClass('hidden');
      $('button#log-out').addClass('hidden');
    }
  });

  $('form#log-in').on('click', '#submit', function(event){
    event.preventDefault();
    logIn();
  })

  $('button#log-out').on('click', function(event){
    event.preventDefault();
    logOut();
  })

  $('#stripe-customers-index').on('click', function(event){
    event.preventDefault();

    $.ajax({
      type: "GET",
      url: API_BASE + "/customers",
      data: {session_token: savedSessionToken()},
      success: function(data,status,jqXHR){
        console.log("console success")
        var customers = data.data;
        sendCustomerInfo(customers);
      },
      error: function(jqXHR,textStatus,errorThrown){
        console.log("console error");
        console.log(jqXHR)
        console.log(textStatus)
        console.log(errorThrown)
      }
    })
  });

  function hideLogInForm(){
    $('form#log-in').addClass('hidden');
  };

  function sendCustomerInfo(customerInfo) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {customerInfo: customerInfo}, function(response) {
        console.log(response);
      });
    });
  };

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

  function logIn () {
    var form = $('form#log-in');
    formData = form.serializeJSON();
    $.ajax({
      type: "POST",
      url: API_BASE + "/session/login",
      data: formData,
      success: function(data,status,jqXHR){
        console.log("console success")
        sendSessionTokenToBg(data["session_token"])
        $logInForm.addClass('hidden');
        $('button#log-out').removeClass('hidden');
      },
      error: function(jqXHR,textStatus,errorThrown){
        console.log("console error");
        console.log(jqXHR)
        console.log(textStatus)
        console.log(errorThrown)
      }
    });
  };

  function sendSessionTokenToBg (sessionToken) {
    chrome.runtime.sendMessage({type: "login", sessionToken: sessionToken}, function(response){
      console.log(response);
    })
  };

  function checkIfLoggedIn (callback) {
    chrome.runtime.sendMessage({type: "logged_in?"}, function(response){
      callback(response.log_in_status);
    })
  };

  function logOut () {
    $.ajax({
      type: "DELETE",
      url: API_BASE + "/session/logout",
      data: {"session_token": savedSessionToken()},
      success: function(data,status,jqXHR){
        console.log("logged out");
        window.localStorage.removeItem('stripe-simple-cs');
        $logInForm.removeClass('hidden');
        $('button#log-out').addClass('hidden');
      },
      error: function(jqXHR, textStatus, errorThrown){
        console.log(jqXHR)
        console.log(textStatus)
        console.log(errorThrown)
        console.log("error in logging out");
      }
    })
  };

});