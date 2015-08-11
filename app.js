var express = require("express");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
require('./sockets')(io);

http.listen(3000, function(){
  console.log('listening on *:3000');
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

require('./routes/routes')(app);


