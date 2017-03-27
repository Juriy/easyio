const sock = io();

const append = (parentId, text) => {
  const parent = document.getElementById(parentId);
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

const sendXhr = () => {
  const req = new XMLHttpRequest();
  const log = append.bind(null, 'api-test');
  log('Running XHR test');

  req.addEventListener('load', () => {
    const { status, statusText, responseText } = req;
    log(`Server response: ${status} [${statusText}]`);

    if (status < 200 || status > 299) {
      return;
    }

    const resp = JSON.parse(responseText);
    log('&nbsp;');
    log(`Connected from: ${resp.address}`);
    log('<strong>Headers (as node.js saw it)</strong>');
    Object.keys(resp.headers).forEach((key) => {
      log(`<strong>${key}</strong>: ${trimText(40, resp.headers[key])}`);
    })

  });

  req.addEventListener('error', (e) => {
    log('Could not reach server');
  });

  req.open('GET', '/api/test');
  req.send();
};

const trimText = (max, text) => {
  return text.length < max ? text : text.substr(0, max - 3) + '...';
};

const onHeartbeat = (payload) => {
  const roundtripTime = Date.now() - payload.timestamp;
  append('log', 'Roundtrip: ' + roundtripTime + 'ms');
};

setInterval(sendHeartbeat, 1000);

sock.on('connect', () => {
  console.log('socket.io connected');
});
sock.on('msg', append.bind(null, 'log'));
sock.on('heartbeat', onHeartbeat);

sendXhr();
