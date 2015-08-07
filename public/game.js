function Players(){
	this.player = null; // will hold the number the player is
	this.msg = '';
	this.winner = ''
};

$(document).ready(function(){
	var username = prompt('What is your name?');
    var socket = io.connect();

	var pathname = window.location.pathname; //pathname that holds # of players
	var players = pathname[parseInt(pathname.length - 1)]; // number of players

	var answers = $('#combos p').html().split(','); //create a variable of all the words in the grid

	var gameid = window.location.pathname.replace('/newgame/', '');
	var gameid = gameid.replace('/', '');

	yo = new Players;

	$.getJSON("/playerassignment", {'gameid' : gameid, 'username' : username, 
		'players' : players}, function(data) {
		var keys = Object.keys(data);
		if (keys[0] == 'full') {
			alert(data.full);
		}
		else {
			yo.player = data.yourNumber;	
		};
		$('body').trigger('nextStep');
	});

	$("body").on('nextStep', function(){
		$.getJSON("/findcurrentplayer/", {'gameid' : gameid }, function(data){
			socket.emit('nextPlayer', data.username + "'s turn!");
			if (username != data.username){
				$('[type=submit]').attr('disabled', 'disabled');
			}
		});
	});

	$("body").on('changePlayer', function() {
		$.getJSON("/changecurrentplayer/", {'gameid' : gameid, 'players' : players}, function(data) {
			socket.emit('nextPlayer', data.username + "'s turn!");
			socket.emit('checkStatus', data.username);
		});
	});

    $('#chat').on('submit', function(){
        socket.emit('chat message', username + ': ' + $('#m').val());
    $('#m').val('');
        return false;
    });

    socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
        $('#messages').scrollTop(99999999999999999999999999999);
    });

	$('#guess').on('submit', function(e){
		e.preventDefault();
		var word = $("[name='word']").val(); //what the player entered to try
		$.getJSON('/scores/', {'gameid':gameid, 'player' : yo.player, 'word' : word}, function(data) {
			if (data.answer == 'Correct') {
				socket.emit('correctAnswer', 'Correct!');
			}
			else if (data.answer == 'Wrong') {
				socket.emit('wrongAnswer', 'wrong');
			}
			if (data.winner == true) {
				$('body').trigger('gameOver');
			};
		});
		$('[name=word]').val('');
		$('body').trigger('changePlayer');
		// $('#scores p').append(yo.playerScores[1]);
	});

	$('body').on('checkStatus', function() {
		if (username != yo.msg){
			$('[type=submit]').attr('disabled', 'disabled');
		}
		else {
			$('[type=submit]').removeAttr('disabled');
		}
	});

	$("body").on('gameOver', function() {
		$.getJSON("/winner/", {'gameid' : gameid, 'players' : players}, function(data) {
			yo.winner = data.winner;
			socket.emit('endgame', yo.winner);
		});
	});

	$('body').on('endgame', function() {
		$('[type=submit]').attr('disabled', 'disabled');
		$('#status').html(yo.winner + ' wins!')
	});

	socket.on('endgame', function(msg) {
		yo.winner = msg
		$('body').trigger('endgame');
	});

	socket.on('checkStatus', function(msg) {
		yo.msg = msg;
		$('body').trigger('checkStatus');
	});
	socket.on('nextPlayer', function(msg) {
		$('#gameArea p').html(msg);
	});
	socket.on('wrongAnswer', function(msg){
		$('#status').html(msg);
	});
	socket.on('correctAnswer', function(msg){
		$('#status').html(msg);
	});
});




