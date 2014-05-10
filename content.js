$(document).ready(function(){
	var API_BASE = 'http://localhost:3000';

	$customerDashboard = $(
		"<div id='customer-dashboard'> \
				<div id='cd-header'><h1>Customer Dash</h1></div> \
				<div id='cd-body' class='hidden'> \
					<div id='log-in'> \
						<span id='welcome'></span> \
				    <button id='log-out' class='hidden'>Log Out</button> \
				    <form id='log-in'> \
				      <label for='user_email'>Email:</label> \
				      <input type='text' id='user_email' name='user[email]'> \
				      <br> \
				      <label for='user_password'>Password:</label> \
				      <input type='password' id='user_password' name='user[password]'> \
				      <br> \
				      <input type='submit' id='submit' value='submit'> \
				    </form> \
					</div> \
					<div id='info-container'> \
						<h2>Search <span id='loading-icon' class='hidden'><img src='" + chrome.extension.getURL('ajax-loader.gif') + "'></span></h2> \
						<form id='query-customer' class='group'> \
							<input type='text' id='customer-email' placeholder='Enter customer email address'> \
						</form> \
						<div id='customer-info'><h2>Customer Info</h2><div id='customer-info-body'></div></div> \
						<div id='customer-orders'><h2>Customer Orders</h2><div id='customer-orders-body'></div></div> \
					</div> \
				</div> \
		</div>"
	)

	$('body').prepend($customerDashboard);

	$('#cd-body').on('submit', 'form#query-customer', function(event){
		event.preventDefault();

		$('div#customer-info-body').html("");
		$('div#customer-orders-body').html("");
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

	function createCustomerInfo(customer) {
		console.log(customer);
		var customerDate = new Date(customer.created_at);
		var name = "<td class='info-title'>Name:</td><td>" + customer.first_name + " " + customer.last_name + "</td>";
		var email = "<td class='info-title'>Email:</td><td class='truncate'>" + customer.email + "</td>";
		var created = "<td class='info-title'>Created:</td><td>" + customerDate.toDateString() + "</td>";
		var note = "<td class='info-title'>Note:</td><td>" + customer.note + "</td>";
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

		var id = "<td class='info-title'>ID:</td><td><a href='" + order.url + "'>" + order.id + "</a></td>";
		var created = "<td class='info-title'>Date:</td><td>" + orderDate.toDateString() + "</td>";
		var subtotal_price = "<td class='info-title'>Subtotal:</td><td>$" + order.subtotal_price + "</td>";
		var totalPrice = "<td class='info-title'>Total:</td><td>$" + order.total_price + "</td>";
		var lineItems = "<td class='info-title'>Items:</td><td>" + items.join('<br>') + "</td>";
		var fullfillmentStatus = "<td class='info-title'>Status:</td><td>" + order.fullfillment_status + "</td>";

		var $table = $("<table class='order-info-list'></table>");

		$.each([id, created, subtotal_price, totalPrice, lineItems, fullfillmentStatus], function(idx, val){
			var $row = $("<tr>" + val + "</tr>");
			$table.append($row);
		});

		return $table;
	};

	$('#cd-header').on('click', function(event){
		$('#cd-body').toggleClass('hidden');
		$('input#customer-email').focus();
	});

	var $logInForm = $('form#log-in');

  checkIfLoggedIn(function(loggedIn){
    if (loggedIn){
      $logInForm.addClass('hidden');
      $('button#log-out').removeClass('hidden');
    } else {
      // logged out
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
  });

  function logIn () {
    var form = $('form#log-in');
    formData = form.serializeJSON();
    $.ajax({
      type: "POST",
      url: API_BASE + "/session/login",
      data: formData,
      success: function(data,status,jqXHR){
        console.log("console success")
        sendMessageToBg({type: "login", sessionToken: data["session_token"]});
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
    getSessionTokenFromBg(function(session_token){
      $.ajax({
        type: "DELETE",
        url: API_BASE + "/session/logout",
        data: {"session_token": session_token},
        success: function(data,status,jqXHR){
          sendMessageToBg({type: "logout"})
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
    })
  };

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
      callback(response.log_in_status);
    })
  };
	
})