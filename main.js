const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (sock) => {
  console.log('Client connected');

  sock.on('heartbeat', (payload) => {
    sock.emit('heartbeat', payload);
  });

  sock.on('disconnect', () => {
    console.log('Socket Disconnected');
  });
});

server.listen(8080, (err) => {
  if (err) {
    console.log(err.stack);
    return;
  }

  console.log('Listening on :8080');
});
