///// Socket commands ////
module.exports = function(io) {
  io.on('connection', function(socket){
    var a = socket.handshake.headers.referer.slice(30).replace('/', '');
    socket.join(a);

    socket.on('loggedout', function(msg){
      io.to(a).emit('loggedout', msg);
    });

    socket.on('chat message', function(msg){
      	io.to(a).emit('chat message', msg);
    });

    socket.on('wrongAnswer', function(msg){
    		io.to(a).emit('wrongAnswer', msg);
    });

    socket.on('correctAnswer', function(msg){
    		io.to(a).emit('correctAnswer', msg);
    });

    socket.on('nextPlayer', function(msg){
    		io.to(a).emit('nextPlayer', msg);
    }); 

    socket.on('checkStatus', function(msg) {
      io.to(a).emit('checkStatus', msg);
    });

    socket.on('newAnswers', function(msg) {
      io.to(a).emit('newAnswers', msg);
    });

    socket.on('endgame', function(msg) {
      io.to(a).emit('endgame', msg);
    });

    socket.on('loggedin', function(msg) {
      io.to(a).emit('loggedin', msg);
    });

    socket.on('updateFoundWords', function(msg) {
      io.to(a).emit('updateFoundWords', msg);
    });

    socket.on('scores', function(msg) {
      io.to(a).emit('scores', msg);
    });    

  });
};