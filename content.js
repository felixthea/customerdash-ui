$(document).ready(function(){
	// console.log("here 1215");
	// var $div = $('<div class="stripe-cs"></div>')
	// // var connectLink = '<a href="https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_3y0MIx6qE1DOARYB3eYGWNs2nRia3CvS" class="stripe-connect"><span>Connect with Stripe</span></a>'

	// // $div.html(connectLink);
	// var googleConnectLink = '<a href="#">Connect with Gmail</a>';
	// $div.html(googleConnectLink);

	// $('body').on('click', 'div.stripe-cs a', function(event){
	// 	event.preventDefault();
	// 	$.ajax({
	// 		type: 'get',
	// 		url: 'http://localhost:3000/auth/google_oauth2',
	// 		success: function(data,status,jqXHR){
	// 			console.log(data);
	// 			console.log(status);
	// 			console.log(jqXHR);
	// 		},
	// 		error: function(jqXHR,textStatus,errorThrown){
 //        console.log(jqXHR)
 //        console.log(textStatus)
 //        console.log(errorThrown)
 //      }
	// 	})
	// })

	// $('body').prepend($div);
	
	// setTimeout(function (){
	// 	var customer = $('span.gD').attr("email");
	// 	console.log(customer);
	// }, 3000);

	chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	var customerInfos = request.customerInfo;
    sendResponse({farewell: "got it"});

    var customer = $('span.gD').attr('email');
    $.each(customerInfos, function(idx, customerInfo){
    	if(customerInfo.email == customer){
    		console.log("found " + customerInfo.email);
    	} else {
    		console.log("only found " + customerInfo.email);
    	}
    })

  });
	
})