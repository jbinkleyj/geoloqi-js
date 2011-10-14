window.addEventListener("message", function(event) {
  geoloqiReceiver.messageListener(event);
}, false);

var geoloqiReceiver = (function() {
  var apiUrl = 'https://api.geoloqi.com/1/';
  var version = '0.0.1'
  var exports = {};

  function messageListener(event) {
    // if (event.origin !== "http://127.0.0.1:9292")
    // return;
    var request = JSON.parse(event.data);

    geoloqiReceiver.execute(request, function(payload) {
      payload.callbackId = request.callbackId;
      event.source.postMessage(JSON.stringify(payload), event.origin);
    });
  }
  exports.messageListener = messageListener;

  function execute(o, callback) {
    var headers = {'Content-Type': 'application/json',
                   'X-Geoloqi-Version': 'geoloqi-client-js '+o.version+' receiver '+version,
                   'Accept': 'application/json'};

    if(typeof(o.accessToken) === 'string') {
      headers['Authorization'] = 'OAuth '+o.accessToken;
    }

    var xhr = util.getXHR();

    xhr.onreadystatechange = function(){
      if (4 === xhr.readyState) {
        var payload = {};
        if (xhr.status === 200) {
          payload.response = xhr.responseText;
        } else {
          payload.error = {status: xhr.status, message: xhr.responseText};
        }
        callback(payload);
      }
    };

    var fullUrl = apiUrl+o.path;

    xhr.open(o.method, fullUrl, true);

    // set header fields
    for (var field in headers) {
      xhr.setRequestHeader(field, headers[field]);
    }

    if (o.method === 'POST') {
      xhr.send(JSON.stringify(args));
    } else {
      xhr.send();
    }
  }
  exports.execute = execute;

  var util = {};
  util.getXHR = function() {
    if (window.XMLHttpRequest
      && ('file:' != window.location.protocol || !window.ActiveXObject)) {
      return new XMLHttpRequest;
    } else {
      try {
        return new ActiveXObject('Microsoft.XMLHTTP');
      } catch(e) {}
      try {
        return new ActiveXObject('Msxml2.XMLHTTP.6.0');
      } catch(e) {}
      try {
        return new ActiveXObject('Msxml2.XMLHTTP.3.0');
      } catch(e) {}
      try {
        return new ActiveXObject('Msxml2.XMLHTTP');
      } catch(e) {}
    }
    return false;
  }

  return exports;
}());