#!/usr/bin/nodejs
// Browserlink.js
// The server for browserlink.vim
// By Jonathan Warner, 2015
// http://github.com/jaxbot/browserlink.vim

var VERSION = "2.6.0";

console.log("Browserlink");
console.log("Server version: " + VERSION);
console.log("======================");
console.log("Dedicated to everyone who missed the first chest in OOT's Forest Temple");
console.log("");

var WebSocketServer = require("websocket").server;
var http = require("http");
var fs = require("fs");
var path = require("path");

var connections = [];

var consoles = "";
var errors   = [];
var errorMultiplicities = {};

var server = http.createServer(function(request, response) {
  console.log("Requested: " + request.url);

  var pieces = request.url.split("/");

  switch (pieces[1]) {
    case "cursor":
      broadcast(pieces[1] + ":" + pieces[2] + ":" + pieces[3]);
      break;
    case "fileChanged":
      broadcast(pieces[1] + ":" + pieces[2]);
      break;
    case "download":
      let pth = request.url.substr(1);
      pth = pth.substr(pth.indexOf('/')+1);
      break;
    case "reload":

      let file = "";
      if (pieces[2] == "page") file = "index.html";
      if (pieces[2] == "css" ) file = "index.css";
      if (pieces[2] == "js"  ) file = "index.js";

      let pth = "/home/blackcap/school/25.08/tst/";

      fs.readFile(path.resolve(pth, file), "utf8", function(err, data) {
        if (err) { console.log(err); }
        broadcast(file + ":" + data);
      });

      // broadcast(pieces[2]);
      break;
    case "evaluate":
      request.on('data', function(data) {
        broadcast(data);
      });
      break;
    case "errors":
      response.writeHead(200);
      response.end(errors.map(function(error){
        error.multiplicity = errorMultiplicities[error];
        return JSON.stringify(error);
      }).join("\n"));
      break;
    case "clearerrors":
      errors = [];
      errorMultiplicities = {};
      break;
    case "js":
      fs.readFile(path.resolve(__dirname + "/js", pieces[2]), "utf8", function(err, data) {
        if (err) {
          console.log(err);
        }
        response.setHeader('content-type', 'text/javascript');
        response.writeHead(200);
        response.end(data);
      });
      return;
    case "console":
      response.writeHead(200);
      response.end(consoles);
      return;
    case "clear":
      consoles = "";
      break;
  }

  response.writeHead(200);
  response.end("Browserlink " + VERSION);

});

server.listen(9001, function() {
  console.log("Server listening on port 9001");
});

wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

wsServer.on('request', function(request) {

  var connection = request.accept('', request.origin);
  console.log("Connection accepted.");

  connections.push(connection);
  var i = connections.length - 1;

  connection.on('close', function(reasonCode, description) {
    console.log("Disconnected: " + connection.remoteAddress);
    connections.splice(i, 1);
  });
  connection.on('message', function(msg) {
    var content = JSON.parse(msg.utf8Data);
    console.log(content);
    switch(content.type) {
    case 'log':
      consoles += content.message + "\n" + content.stacktrace + "\n\n";
      break;
    case 'error':
      if (errorMultiplicities.hasOwnProperty(content)) {
        errorMultiplicities[content] += 1;
      } else {
        errorMultiplicities[content] = 1;
        errors.push(content);
      }
      break;
    }
  });
});

function broadcast(data) {
  for (var i = 0; i < connections.length; i++) {
    connections[i].sendUTF(data);
  }
  // console.log("Broadcast: " + data);
}

