///// Socket commands ////
module.exports = function(io) {
  io.on('connection', function(socket){
    var a = socket.handshake.headers.referer.slice(30).replace('/', '')
    socket.join(a);
  	console.log('a user connected');
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
    })
  });
};