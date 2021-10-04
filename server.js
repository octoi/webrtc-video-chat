const express = require('express');
const path = require('path');

var app = express();
var server = app.listen(3000, function () {
  console.log('Listening on port 3000');
});

const io = require('socket.io')(server, {
  allowEIO3: true,
});
app.use(express.static(path.join(__dirname, '')));

var userConnections = [];

io.on('connection', (socket) => {
  console.log('socket id is ', socket.id);

  socket.on('userconnect', (data) => {
    console.log('user connect: ', data.displayName, data.meeting_id);

    var other_users = userConnections.filter(
      (p) => p.meeting_id == data.meeting_id
    );

    userConnections.push({
      connectionId: socket.id,
      user_id: data.displayName,
      meeting_id: data.meeting_id,
    });

    other_users.forEach((v) => {
      socket.to(v.connectionId).emit('inform_others_about_me', {
        other_user_id: data.displayName,
        connId: socket.id,
      });
    });
  });
});
