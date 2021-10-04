var AppProcess = function () {
  async function _init(SDP_function, connId) {}

  var iceConfig = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
      {
        urls: 'stun:stun1.l.google.com:19302',
      },
    ],
  };

  async function setConnection(connId) {
    var connection = new RTCPeerConnection(iceConfig);

    connection.onnegotiationneeded = async function (event) {
      await setOffer(connId);
    };
    connection.onicecandidate = function (event) {
      if (event.candidate) {
        serverProcess(
          JSON.stringify({ iceCandidate: event.candidate }),
          connId
        );
      }
    };
  }

  return {
    setNewConnection: async function (connId) {
      await setConnection(connId);
    },
    init: async function (SDP_function, connId) {
      await _init(SDP_function, connId);
    },
  };
};

var MyApp = (function () {
  var socket = null;
  var user_id = '';
  var meeting_id = '';

  function init(uid, mid) {
    user_id = uid;
    meeting_id = mid;
    event_process_for_signaling_server();
  }

  function event_process_for_signaling_server() {
    socket = io.connect();

    var SDP_function = function (data, connId) {
      socket.emit('SDPProcess', {
        message: data,
        to_connId: to_connId,
      });
    };

    socket.on('connect', () => {
      if (socket.connected) {
        AppProcess.init(SDP_function, socket.id);
        if (user_id != '' && meeting_id != '') {
          socket.emit('userconnect', {
            displayName: user_id,
            meeting_id: meeting_id,
          });
        }
      }
    });

    socket.on('inform_others_about_me', (data) => {
      addUser(data.other_user_id, data.connId);
      AppProcess.setNewConnection(data.connId);
    });

    function addUser(other_user_id, connId) {
      var newDivId = $('#otherTemplate').clone();
      newDivId = newDivId.attr('id', connId).addClass('other');
      newDivId.find('h2').text = other_user_id;
      newDivId.find('video').attr('id', `v_${connId}`);
      newDivId.find('audio').attr('id', `a_${connId}`);
      newDivId.show();
      $('#divUsers').append(newDivId);
    }
  }

  return {
    _init: function (uid, mid) {
      init(uid, mid);
    },
  };
})();
