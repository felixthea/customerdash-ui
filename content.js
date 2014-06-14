$(document).ready(function(){
	// var API_BASE = 'https://www.emailinboxcrm.com';
	var API_BASE = 'http://localhost:3000'

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
							<div id='search-container' class='customer-dashboard-clearfix'> \
								<div id='sc-left'> \
									Search \
									<select id='search-scope'> \
										<option value='email'>by Email</option> \
										<option value='name'>by Name</option> \
										<option value='order_num'>by Order #</option> \
									</select> \
									<span id='loading-icon' class='hidden'><img src='" + chrome.extension.getURL('ajax-loader.gif') + "'></span> \
								</div> \
								<div id='sc-right'> \
									<a href='#' id='log-out'>Log Out</a> \
								</div> \
							</div> \
							<form id='query-customer-by-email' class='customer-dashboard-clearfix'> \
								<input type='text' id='customer-search-query-email' placeholder='Enter customer email address'> \
								<input type='submit' value='Search'> \
							</form> \
							<form id='query-customer-by-name' class='customer-dashboard-clearfix hidden'> \
								<input type='text' id='customer-search-query-first-name' placeholder='Enter first name (optional)'> \
								<input type='text' id='customer-search-query-last-name' placeholder='Enter last name (optional)'> \
								<input type='submit' value='Search'> \
							</form> \
							<form id='query-customer-by-order-num' class='customer-dashboard-clearfix hidden'> \
								<input type='text' id='customer-search-query-order-num' placeholder='Enter order number'> \
								<input type='submit' value='Search'> \
							</form> \
							<div id='customer-results' class='hidden'><h2>Select a Customer</h2><div id='customer-results-body'></div></div> \
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
	var $searchForms = [
		$('#customer-dashboard form#query-customer-by-email'),
		$('#customer-dashboard form#query-customer-by-name'),
		$('#customer-dashboard form#customer-search-query-order-num')]

	$('#cd-body').on('change', 'select#search-scope', function(event){
		var selection = $(this).val();
		var fields = ["#query-customer-by-name", "#query-customer-by-email", "#query-customer-by-order-num"]

		$.each(fields, function(idx, field){ $(field)[0].reset(); });

		if (selection == "name") {
			toggleSearchFields("#query-customer-by-name", fields);
		} else if(selection == "email") {
			toggleSearchFields("#query-customer-by-email", fields);
		} else if(selection == "order_num") {
			toggleSearchFields("#query-customer-by-order-num", fields);
		};

	});

	function toggleSearchFields (activeSearch, fields) {
		var turnOffFields = fields

		$.each(turnOffFields, function(idx, field){
			if (activeSearch == field) {
				$(field).removeClass('hidden');
			} else {
				$(field).addClass('hidden');
			}
		});
	};

	$('#cd-body').on('submit', 'form#query-customer-by-name', function(event){
		event.preventDefault();
		console.log("query customer by name");
		clearBody();
		showLoading();

		var firstName = $('#customer-search-query-first-name').val();
		var lastName = $('#customer-search-query-last-name').val();

		chrome.runtime.sendMessage({type: "retrieve_customer_by_full_name", firstName: firstName, lastName: lastName}, function(data){
			var customers = _.values(data.customers);
			var customersList;

			if (customers !== undefined) {
				if(customers.length > 1) {
					// found multiple customers with matching name

					customersList = $('<ul id="customer-list"></ul>');
					$.each(customers, function(idx, customer){
						customersList.append(
							'<li><a data-customer-id="' + customer.id + '" href="#">' + customer.first_name + " " + customer.last_name + " (" + customer.email + ')</a></li>');
					});

					$('div#customer-results').removeClass('hidden');
					$('div#customer-results-body').html(customersList);
					hideLoading();
				} else if (customers.length == 1) {
					// found exactly one customer with matching name
					retrieveCustomerByEmailWithOrders(customers[0].email)
				}
			} else {
				// found no customers with matching name
				hideLoading();
				populateCustomerAndOrders({customer: undefined})
			}
		})
	});

	$('#cd-body').on('submit', 'form#query-customer-by-email', function(event){
		event.preventDefault();

		clearBody();
		showLoading();

		var customerEmail = $('input#customer-search-query-email').val();

		retrieveCustomerByEmailWithOrders(customerEmail)
	});

	$('#cd-body').on('submit', 'form#query-customer-by-order-num', function(event){
		event.preventDefault();

		clearBody();
		showLoading();

		var orderNum = $('#customer-search-query-order-num').val();

		chrome.runtime.sendMessage({type: "retrieve_customer_with_orders_by_order_num", orderNum: orderNum}, function(data) {
			hideLoading();
			populateCustomerAndOrders(data);
		})
	});

	function showLoading() { $('#loading-icon').removeClass('hidden'); };

	function hideLoading() { $('#loading-icon').addClass('hidden'); };

	$('#cd-body').on('click', '#customer-list a', function(event){
		event.preventDefault();
		var customerId = $(this).attr("data-customer-id");
		chrome.runtime.sendMessage({type: "get_customer_and_orders_from_storage", customerId: customerId}, function(customerWithOrders){
			// expect this format: {"customer": {}, "orders": {}}
			populateCustomerAndOrders(customerWithOrders);
		})
		// retrieveCustomerByEmailWithOrders(customerEmail);
	})

	function retrieveCustomerByEmailWithOrders (customerEmail) {
		chrome.runtime.sendMessage({type: "retrieve_customer_by_email_with_orders", customerEmail: customerEmail}, function(data) {
			hideLoading();
			populateCustomerAndOrders(data);
		});
	}

	function populateCustomerAndOrders (data){
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
	}

	function updateBody(obj){
		$('#customer-info-body').html(obj.customer);
		$('#customer-orders-body').html(obj.orders);
	};

	function clearBody(){
		$('div#customer-info-body').html("");
		$('div#customer-orders-body').html("");
		$('div#customer-results-body').html("");
		$('div#customer-results').addClass('hidden');
	};

	function createCustomerInfo(customer) {
		console.log(customer);
		var customerDate = new Date(customer.created_at);
		var name = "<td class='info-title'>Name:</td><td>" + customer.first_name + " " + customer.last_name + "</td>";
		var email = "<td class='info-title'>Email:</td><td class='truncate'>" + customer.email + "</td>";
		var created = "<td class='info-title'>Created:</td><td>" + customerDate.toDateString() + "</td>";
		var note = "<td class='info-title'>Note:</td><td id='customer-note' data-id='" + customer.id + "'>" + customer.note + "</td>";
		var lifetimeSpent = "<td class='info-title'>Total Spent:</td><td>" + customer.total_spent + "</td>";
		var lifetimeOrderCount = "<td class='info-title'>Total Orders:</td><td>" + customer.order_count + "</td>";
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

		var id = "<td class='info-title'>ID:</td><td><a href='" + order.url + "'>" + order.order_number + "</a></td>";
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
		$('input#customer-search-query').focus();
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
    	// user is logged in and they are still on their trial or their account is in good standing
    	setLoggedInState();
    } else if (response.log_in_status && (response.trial_days_left <= 0 && !response.good_standing)) {
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
    formData["email_client"] = window.location.origin;

    $.ajax({
      type: "POST",
      url: API_BASE + "/session/login",
      data: formData,
      success: function(data,status,jqXHR){
        sendMessageToBg({type: "login", sessionToken: data["session_token"]});
        setLoggedInState();
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
    $.each($searchForms, function(idx, form) { form[0].reset(); })
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