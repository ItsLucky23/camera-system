import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const wss = new WebSocketServer({ host: '0.0.0.0', port: 8090 });
const clientSockets: Record<string, WebSocket> = {} // every socket that connects via the browser that wants to receive the video capture
const esp32: Record<string, WebSocket> = {} // every socket that connects that is a esp32 camera
let cameraActive = false;

// esp32 cam will send a message { socketType: 'esp32' }
// than it waits until a client request video footage
// when cam receives request = 'captureVideo it will send images as the object { request: 'video', data: base64Img }
// the cam stops whenever all client sockets leave the page

// client will send a message { socketType: 'client', request: 'getVideo' } wich will trigger all active esp32 cams
// it than waits for the socket server to send a message back { request: 'videoOutput', data: base64Img } and displays the given images
// if the client closes the browser the video ouput will stop if there is no other client connected

//log ip of server socket adress
console.log('WebSocket server running on ws://' + wss.options.host + ':' + wss.options.port);

wss.on('connection', (ws, req) => {
  const socketId = uuidv4();  // generate a unique ID

  ws.on('message', (message, isBinary) => {
    if (!isBinary) {
      const { socketType, request } = JSON.parse(message.toString())

      if (socketType == 'client') { 
        console.log('client connected on ip' + req.socket.remoteAddress)
        clientSockets[socketId] = ws }
      else if (socketType == 'esp32') { 
        console.log('esp32 connected')
        esp32[socketId] = ws 
        if (cameraActive) {
          ws.send(JSON.stringify({ request: 'captureVideo' })) 
        }
      }

      if (request == 'getVideo') {
        if (cameraActive) { return }
        cameraActive = true;
        console.log('start streaming')
        for (const cam of Object.values(esp32)) {
          cam.send(JSON.stringify({ request: 'captureVideo' }))
        }
      }
    } else {
      for (const client of Object.values(clientSockets)) {
        if (client.readyState === 1) {  // only send if connection is open
          client.send(message, { binary: true });
        }
      }
    }
  });

  ws.on('close', () => {
    // cleanup disconnected sockets
    if (clientSockets[socketId]) {
      console.log('client disconnecting')
      delete clientSockets[socketId];
      if (Object.values(clientSockets).length === 0) { 
        cameraActive = false; 
        console.log('stop streaming')
        for (const cam of Object.values(esp32)) {
          cam.send(JSON.stringify({ request: 'stopVideo' }))
        }
      }
    } else if (esp32[socketId]) {
      console.log('esp32 disconnecting')
      delete esp32[socketId];
    }
  });

  ws.on('error', (err) => {
    console.log('WebSocket error:', err);
  });

});

wss.on('error', err => {
  console.error('Server error:', err);
});