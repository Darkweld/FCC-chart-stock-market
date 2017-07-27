'use strict';

var mongoose = require('mongoose');
var http = require('http');
var WebSocket = require('ws');
var app = require('./app.js');

var port = process.env.PORT || 8080;

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

var server = http.createServer(app);

var wss = new WebSocket.Server({ server: server, path: '/chart' });

wss.on('connection', function connection(ws, req) {
  
  
  ws.on('message', function incoming(message) {
    wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
    });
  });
  
});

server.listen(port, function() {
  console.log('Listening on port ' + port);
});