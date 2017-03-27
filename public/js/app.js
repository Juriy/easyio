const sock = io();

const append = (text) => {
  const parent = document.getElementById('log');
  const item = document.createElement('li');
  item.innerHTML = text;
  parent.appendChild(item);
  parent.scrollTop = parent.scrollHeight;
};

const sendHeartbeat = () => {
  sock.emit('heartbeat', {
    timestamp: Date.now()
  });
};

const onHeartbeat = (payload) => {
  const roundtripTime = Date.now() - payload.timestamp;
  append('Roundtrip: ' + roundtripTime + 'ms');
};

setInterval(sendHeartbeat, 500);

sock.on('connect', () => {
  console.log('socket.io connected');
});
sock.on('msg', append);
sock.on('heartbeat', onHeartbeat);
