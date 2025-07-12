const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let roomState = {
  slide: 0,
  sound: null,
};

wss.on('connection', function connection(ws) {
  // Send current state to new client
  ws.send(JSON.stringify({ type: 'state', data: roomState }));

  ws.on('message', function incoming(message) {
    try {
      const msg = JSON.parse(message);
      if (msg.type === 'update') {
        // Update state and broadcast
        roomState = { ...roomState, ...msg.data };
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'state', data: roomState }));
          }
        });
      }
    } catch (e) {
      console.error('Invalid message', e);
    }
  });
});

console.log('WebSocket server running on ws://0.0.0.0:8080'); 