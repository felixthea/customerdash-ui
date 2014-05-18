$(document).ready(function(){
	var API_BASE = 'https://www.emailinboxcrm.com';

	$customerDashboard = $(
		"<div id='customer-dashboard' class='hidden'> \
				<div id='cd-header'><h1>Customer Dash</h1></div> \
				<div id='cd-body'> \
					<div id='info-container'> \
						<h2 id='sign-in'>Sign In</h2> \
						<div id='log-in'> \
					    <form id='log-in'> \
					      <label for='user_email'>Email:</label> \
					      <input type='text' id='user_email' name='user[email]'> \
					      <br> \
					      <label for='user_password'>Password:</label> \
					      <input type='password' id='user_password' name='user[password]'> \
					      <br> \
					      <input type='submit' id='submit' value='Sign In'> \
					    </form> \
					    Have a question or comment?  Email <a href='mailto:felixthea@gmail.com'>felixthea@gmail.com</a> \
					    <div class='error-msg'></div> \
						</div> \
						<div id='info' class='hidden'> \
							<div id='search-container' class='group'> \
								<div id='sc-left'> \
									Search \
									<span id='loading-icon' class='hidden'><img src='" + chrome.extension.getURL('ajax-loader.gif') + "'></span> \
								</div> \
								<div id='sc-right'> \
									<a href='#' id='log-out'>Log Out</a> \
								</div> \
							</div> \
							<form id='query-customer' class='group'> \
								<input type='text' id='customer-email' placeholder='Enter customer email address'> \
							</form> \
							<div id='customer-info'><h2>Customer</h2><div id='customer-info-body'></div></div> \
							<div id='customer-orders'><h2>Orders</h2><div id='customer-orders-body'></div></div> \
						</div> \
						<div id='trial-over' class='hidden'> \
							<div class='trial-over-prompt'> \
								Your 14 day free trial is complete.<br><a href='https://www.emailinboxcrm.com/plans'>Click here to choose a plan and continue using Email Inbox CRM</a> \
							</div> \
						</div> \
					</div> \
				</div> \
		</div>"
	);

	$('body').prepend($customerDashboard);
	
	var $logInForm = $('#customer-dashboard form#log-in');
	var $logOutLink = $('#customer-dashboard a#log-out');
	var $customerDashInfo = $('#customer-dashboard #info');
	var $logInHeader = $('#customer-dashboard h2#sign-in');
	var $logInDiv = $('#customer-dashboard div#log-in');
	var $searchForm = $('#customer-dashboard form#query-customer');

	$('#cd-body').on('submit', 'form#query-customer', function(event){
		event.preventDefault();

		clearBody();
		$('#loading-icon').removeClass('hidden');

		var customerEmail = $('input#customer-email').val();

		chrome.runtime.sendMessage({type: "retrieve_customer_with_orders", customerEmail: customerEmail}, function(data) {
		  $('#loading-icon').addClass('hidden');

			if(data.customer !== undefined && data.orders.length > 0) {
				var $customerInfoTable = createCustomerInfo(data.customer);
				var $ordersInfoTable = createOrdersInfo(data.orders);

				updateBody({customer: $customerInfoTable, orders: $ordersInfoTable});
			} else if (data.customer !== undefined) {
				var $customerInfoTable = createCustomerInfo(data.customer);

				updateBody({customer: $customerInfoTable, orders: "No orders found."})
			} else {
				updateBody({customer: "No customer found", orders: "No orders found."});
			}
		});
	});

	function updateBody(obj){
		$('#customer-info-body').html(obj.customer);
		$('#customer-orders-body').html(obj.orders);
	};

	function clearBody(){
		$('div#customer-info-body').html("");
		$('div#customer-orders-body').html("");
	}

	function createCustomerInfo(customer) {
		console.log(customer);
		var customerDate = new Date(customer.created_at);
		var name = "<td class='info-title'>Name:</td><td>" + customer.first_name + " " + customer.last_name + "</td>";
		var email = "<td class='info-title'>Email:</td><td class='truncate'>" + customer.email + "</td>";
		var created = "<td class='info-title'>Created:</td><td>" + customerDate.toDateString() + "</td>";
		var note = "<td class='info-title'>Note:</td><td id='customer-note' data-id='" + customer.id + "'>" + customer.note + "</td>";
		// var lifetimeSpent = "<td class='info-title'>Total Spent:</td><td>" + customer.total_spent + "</td>";
		var lifetimeSpent = "<td class='info-title'>Total Spent:</td><td>$153.49</td>";
		// var lifetimeOrderCount = "<td class='info-title'>Total Orders:</td><td>" + customer.order_count + "</td>";
		var lifetimeOrderCount = "<td class='info-title'>Total Orders:</td><td>4</td>";
		var $table = $('<table id="customer-info-list"></table>');

		$.each([name, email, created, note, lifetimeSpent, lifetimeOrderCount], function(idx, val){
			$table.append($('<tr>' + val + '</tr>'));
		});

		return $table;
	};

	function createOrdersInfo(orders) {
		console.log(orders);
		var $div = $('<div id="orders"></div>');

		$.each(orders, function(idx, order){
			var $table = createOrderInfo(order);
			$div.append($table);
		})

		return $div;
	};

	function createOrderInfo(order) {
		var orderDate = new Date(order.created_at);
		var items = $.map(order.line_items, function(item, idx){
			return item.name + " (" + item.quantity + ")";
		});

		var id = "<td class='info-title'>ID:</td><td><a href='" + order.url + "'>" + order.id + "</a></td>";
		var created = "<td class='info-title'>Date:</td><td>" + orderDate.toDateString() + "</td>";
		var subtotal_price = "<td class='info-title'>Subtotal:</td><td>$" + order.subtotal_price + "</td>";
		var totalPrice = "<td class='info-title'>Total:</td><td>$" + order.total_price + "</td>";
		var lineItems = "<td class='info-title'>Items:</td><td>" + items.join('<br>') + "</td>";
		var fulfillmentStatus = "<td class='info-title'>Status:</td><td>" + order.fulfillment_status + "</td>";
		var trackingNumbers = "<td class='info-title'>Tracking Numbers:</td><td> " + $.map(order.fulfillments, function(fulfillment, idx){ return fulfillment.tracking_number; }).join('<br>') + "</td>";
		var note = "<td class='info-title'>Notes:</td><td id='order-note' data-id='" + order.id + "'>" + order.note + "</td>"; 
		var $table = $("<table class='order-info-list'></table>");

		$.each([id, created, subtotal_price, totalPrice, lineItems, fulfillmentStatus, trackingNumbers, note], function(idx, val){
			var $row = $("<tr>" + val + "</tr>");
			$table.append($row);
		});

		return $table;
	};

	$('#cd-header').on('click', function(event){
		$('#cd-body').toggleClass('hidden');
		$('input#customer-email').focus();
	});

	$('#customer-dashboard').on('click', 'td#order-note', function(event){
		var orderId = $(this).attr('data-id');
		var originalNote = $(this).html();
		$(this).attr("id","order-note-edit");
		$(this).html("<input type='text' data-id='" + orderId + "' value='" + originalNote + "'>")
	});

	$('#customer-dashboard').on('focusout', 'td#order-note-edit input', function(event){
		var $parentTd = $(this).parent();
		var newNote = $(this).val();
		var orderId = $parentTd.attr("data-id");

		$parentTd.attr("id", "order-note");
		$parentTd.text(newNote);
		sendMessageToBg({type: "update_order", orderId: orderId, newParams: {note: newNote}})
	});

	$('#customer-dashboard').on('click', 'td#customer-note', function(event){
		var customerId = $(this).attr('data-id');
		var originalNote = $(this).html();
		$(this).attr("id","customer-note-edit");
		$(this).html("<input type='text' data-id='" + customerId + "' value='" + originalNote + "'>");
	});

	$('#customer-dashboard').on('focusout', 'td#customer-note-edit input', function(event){
		var $parentTd = $(this).parent();
		var newNote = $(this).val();
		var customerId = $parentTd.attr("data-id");

		$parentTd.attr("id", "customer-note");
		$parentTd.text(newNote);
		sendMessageToBg({type: "update_customer", customerId: customerId, newParams: {note: newNote}});
	});

  checkIfLoggedIn(function(response){
  	console.log(response);
    if (response.log_in_status && (response.trial_days_left > 0 || response.good_standing)){
    	console.log("here1");
    	// user is logged in and they are still on their trial or their account is in good standing
    	setLoggedInState();
    } else if (response.log_in_status && (response.trial_days_left <= 0 && !response.good_standing)) {
    	console.log("here2");
    	// user is logged in but their trial is over and their account is in bad standing meaning they
    	// haven't signed up for a paid plan
    	setPayToContinueState();
    } else {
    	// user is logged out (did not check the status of their trial)
      setLoggedOutState();
    }
  });

  $('form#log-in').on('click', '#submit', function(event){
    event.preventDefault();
    logIn();
  })

  $('a#log-out').on('click', function(event){
    event.preventDefault();
    logOut();
  });

  function logIn () {
    var form = $('form#log-in');
    formData = form.serializeJSON();
    $.ajax({
      type: "POST",
      url: API_BASE + "/session/login",
      data: formData,
      success: function(data,status,jqXHR){
        sendMessageToBg({type: "login", sessionToken: data["session_token"]});
        setLoggedInState();
        console.log(data, status, jqXHR)
      },
      error: function(jqXHR,textStatus,errorThrown){
        console.log("error logging in");
        $('div.error-msg').html(jqXHR.responseText)
      }
    });
  };

  function logOut () {
    getSessionTokenFromBg(function(session_token){
      $.ajax({
        type: "DELETE",
        url: API_BASE + "/session/logout",
        data: {"session_token": session_token},
        success: function(data,status,jqXHR){
          sendMessageToBg({type: "logout"})
          setLoggedOutState();
        },
        error: function(jqXHR, textStatus, errorThrown){
          console.log("error in logging out");
        }
      })
    })
  };

  function setLoggedInState() {
  	$logInForm.addClass('hidden');
    $logOutLink.removeClass('hidden');
    $customerDashInfo.removeClass('hidden');
    $logInHeader.addClass('hidden');
    $logInDiv.addClass('hidden');
  };

  function setLoggedOutState() {
  	$logInForm.removeClass('hidden');
    $logOutLink.addClass('hidden');
    $customerDashInfo.addClass('hidden');
    $logInHeader.removeClass('hidden');
    $logInDiv.removeClass('hidden');
    $searchForm[0].reset();
    clearBody();
  };

  function setPayToContinueState() {
  	$('#trial-over').removeClass('hidden');
  	$logInForm.addClass('hidden');
  	$logInHeader.addClass('hidden');
    $logInDiv.addClass('hidden');
  }

  function getSessionTokenFromBg (callback) {
    chrome.runtime.sendMessage({type: "get_session_token"}, function(response){
      callback(response.session_token);
    })
  };

  function sendMessageToBg (msg) {
    chrome.runtime.sendMessage(msg), function(response){
      console.log(response);
    };
  };

  function checkIfLoggedIn (callback) {
    chrome.runtime.sendMessage({type: "logged_in?"}, function(response){
      callback(response);
    })
  };

  function updateOrderNote (orderId, newParams) {
  	chrome.runtime.sendMessage({type: "update_order", orderId: orderId, newParams: newParams}, function(response){
      console.log(response);
    })
  }

  chrome.runtime.onMessage.addListener(function(msg, sender, response){
  	if (msg.message == "toggle customer dash") {
  		$('div#customer-dashboard').toggleClass('hidden');
  	}
  })
})