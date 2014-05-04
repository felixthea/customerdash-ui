$(document).ready(function(){
	window.setTimeout(function(){
		var customerEmail = $('span.gD').attr('email');
		var port = chrome.runtime.connect({name: "knock"});

		port.postMessage({customer: customerEmail});
		port.onMessage.addListener(function(msg){
			console.log(msg);
		});
	}, 3000);
	
})