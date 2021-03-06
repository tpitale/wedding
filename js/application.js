// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var RSVP = RSVP || {};

RSVP.getJSON = function(url, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status >= 200 && this.status < 400) {
        // Success!
        var data = JSON.parse(this.responseText);

        callback(data);
      } else {
        // Error :(
      }
    }
  };

  request.send();
  request = null;
}

RSVP.prepare_step_1 = function() {
  var reservation_step_1 = document.getElementById('reservation_step_1');
  if (reservation_step_1.attachEvent) {
    reservation_step_1.attachEvent("submit", RSVP.prepare_step_2);
  } else {
    reservation_step_1.addEventListener("submit", RSVP.prepare_step_2);
  }
}

RSVP.prepare_step_2 = function(e) {
  if (e.preventDefault) e.preventDefault();

  var reservation_step_2 = document.getElementById('reservation_step_2');

  var street_number = document.getElementById('street_number');
  var postal_code = document.getElementById('postal_code');

  document.getElementById('rsvp_street_number').value = street_number.value;
  document.getElementById('rsvp_postal_code').value = postal_code.value;

  RSVP.advance_step_2(street_number.value, postal_code.value);

  // You must return false to prevent the default form behavior
  return false;
}

RSVP.advance_step_2 = function(street_number, postal_code) {
  url = "https://rsvp.pitaleerb.com/invites/"+street_number+"-"+postal_code+".json";

  RSVP.getJSON(url, RSVP.enable_step_2);
}

RSVP.enable_step_2 = function(data) {
  console.log(data);

  // hide step 1
  var reservation_step_1 = document.getElementById('reservation_step_1');
  reservation_step_1.style.display = 'none';

  var reservation_step_2 = document.getElementById('reservation_step_2');
  reservation_step_2.style.display = 'block';

  var guests_set = document.getElementById('guests-set');

  // get guest-template
  var template = document.getElementById('guest-template');

  // for each data["guests"] do:
  for (i in data["guests"]) {
    var name = data["guests"][i];
    var space_text = document.createTextNode(" ");
    var label_text = document.createTextNode(name);

    // duplicate guest-template
    var node = template.cloneNode(true);
    node.id = ''; // remove guest-template id

    var input = node.firstChild;

    // add name downcase to label for and input id
    node.setAttribute('for', node.getAttribute('for')+name.toLowerCase());
    input.id = input.id+name.toLowerCase();

    // add name as value
    input.value = name;

    // add name after input
    // input.innerHTML = name;
    node.appendChild(space_text);
    node.appendChild(label_text);

    // set label display:block
    node.style.display = 'block';

    guests_set.appendChild(node);
  }
}

RSVP.rsvp = function() {
  var code = getParameterByName("code");

  if(code !== null) {
    [street_number, postal_code] = code.split("-");

    RSVP.advance_step_2(street_number, postal_code);
  } else {
    RSVP.prepare_step_1();
  }
}

UTIL = {
  exec: function( page ) {
    var ns = RSVP;

    if ( page !== "" && ns[page] && typeof( ns[page] ) == "function" ) {
      ns[page]();
    }
  },

  init: function() {
    var body = document.body, page = body.getAttribute( "data-page" );

    // UTIL.exec( "common" );
    UTIL.exec( page );
  },

  ready: function(fn) {
    if (document.readyState != 'loading'){
      fn();
    } else if (document.addEventListener) {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      document.attachEvent('onreadystatechange', function() {
        if (document.readyState != 'loading')
          fn();
      });
    }
  }
};

UTIL.ready(UTIL.init);
