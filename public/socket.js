// $(document).ready(function () {
// 	var socket = io.connect();
// 	var $messageBox = $('#message');
// 	var $chat = $('#chat');

// 	$('#send-message').on('submit', function(e){
// 		e.preventDefault();
// 		socket.emit('send message', $messageBox.val());
// 		$messageBox.val('');
// 	});
// 	socket.on('new message', function(data){
// 		$chat.append(data + "<br/>");
// 	});
// });