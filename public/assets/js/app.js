var MyApp = (function () {
  function init(uid, mid) {
    event_process_for_signaling_server();
  }

  var socket = null;
  function event_process_for_signaling_server() {
    socket = io.connect();
    socket.on('connect', () => alert('socket connected to server'));
  }

  return {
    _init: function (uid, mid) {
      init(uid, mid);
    },
  };
})();
