var WebSocketServer = require('websocket').server;
const express = require('express');
const app = express();

app.use(express.static('public'));

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('X-Powered-By', '3.2.1');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

const server = require('http').createServer(app);

wsServer = new WebSocketServer({
  httpServer: server,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

const connections = [];

wsServer.on('request', function (request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }

  var connection = request.accept('xf', request.origin);

  connections.push(connection);

  connection.on('message', function (message) {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);
      connections.forEach(s => s.sendUTF(message.utf8Data));
    }
    else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      connections.forEach(s => s.sendBytes(message.binaryData));
    }
  });
  connection.on('close', function (reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});

server.listen(8090);
