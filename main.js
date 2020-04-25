const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const parseArgs = require('minimist');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const args = parseArgs(process.argv.slice(2));
const { name = 'default', port = '8080'} = args;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/test', (req, res) => {
  res.json({
    headers: req.headers,
    address: req.connection.remoteAddress
  });
});

app.get('/api/name', (req, res) => {
  res.json({ name });
});

app.get('/api/info', (req, res) => {
  fs.readFile(`${__dirname}/version.txt`, 'utf8', (err, version) => {
    res.json({
      version: version || 0,
      dirname: __dirname,
      cwd: process.cwd()
    });
  });
});

io.on('connection', (sock) => {
  console.log('Client connected');

  sock.on('heartbeat', (payload) => {
    payload.nodeName = name;
    sock.emit('heartbeat', payload);
  });

  sock.on('disconnect', () => {
    console.log('Socket Disconnected');
  });
});

server.listen(+port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err.stack);
    return;
  }

  console.log(`Node [${name}] listens on http://127.0.0.1:${port}.`);
});
