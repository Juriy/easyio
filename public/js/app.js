const sock = io();

const append = (text) => {
  const parent = document.getElementById('log');
  const item = document.createElement('li');
  item.innerHTML = text;
  parent.appendChild(item);
};

const sendHeartbeat = () => {
  console.log('ping');
  sock.emit('heartbeat', {
    timestamp: Date.now()
  });
};

const onHeartbeat = (payload) => {
  console.log('heartbeat response');
  const roundtripTime = Date.now() - payload.timestamp;
  append('Roundtrip: ' + roundtripTime + 'ms');
};

setInterval(sendHeartbeat, 500);

sock.on('msg', append);
sock.on('heartbeat', onHeartbeat);