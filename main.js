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

  // let counter = 1;
  // const interval = setInterval(() => {
  //   sock.emit('msg', 'count is ' + counter++);
  // }, 1000);

  console.log('PIIIING');
  sock.on('heartbeat', (payload) => {
    sock.emit('heartbeat', payload);
  });

  sock.on('disconnect', () => {
    console.log('Socket Disconnected');
    // clearInterval(interval);
  });
});

server.listen(8080, (err) => {
  if (err) {
    console.log(err.stack);
    return;
  }

  console.log('Listening on http://localhost:8080');
});