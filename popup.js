API_BASE = 'http://localhost:3000'

document.addEventListener('DOMContentLoaded', function () {
  var $logInForm = $('form#log-in');

  if (savedSessionToken() !== null){
    $logInForm.addClass('hidden');
    $('button#log-out').removeClass('hidden');
  } else {
    $logInForm.removeClass('hidden');
    $('button#log-out').addClass('hidden');
  };

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
  })

  function saveSessionToken(sessionToken){
    window.localStorage.setItem('stripe-simple-cs', sessionToken)
  };

  function savedSessionToken(){
    return window.localStorage.getItem('stripe-simple-cs');
  };

  function hideLogInForm(){
    $('form#log-in').addClass('hidden');
  };

  function showAddWordsForm(){
    $('form#add-words').removeClass('hidden');
  };

  function logInUsingSessionToken(savedSessionToken) {
    $.ajax({
      type: "POST",
      url: API_BASE + "/find_current_user",
      data: {"session_token": savedSessionToken},
      success: function(data,status,jqXHR){
        console.log(data);
        console.log(status);
        console.log(jqXHR);
      },
      error: function(jqXHR,textStatus,errorThrown){
        console.log('error finding user using session token');
      }
    })
  };

  function sendCustomerInfo(customerInfo) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {customerInfo: customerInfo}, function(response) {
        console.log(response);
      });
    });
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
        saveSessionToken(data["session_token"])
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
  }

});