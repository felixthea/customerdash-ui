var API_BASE = 'http://localhost:3000';
var savedSessionToken = 'qE519lVBhgnNXV_SO1TAIg';
console.log("in background");

retrieveCustomer("felixthea@gmail.com");

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