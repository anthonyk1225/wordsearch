function Players(){
	this.player = null; // will hold the number the player is
	this.msg = '';
	this.winner = '';
};

$(document).ready(function(){
	var username = prompt('What is your name?', '');
    var socket = io.connect();
   	socket.emit('loggedin', username + ' has logged in');
	var pathname = window.location.pathname; //pathname that holds # of players
	var players = pathname[parseInt(pathname.length - 1)]; // number of players
	var gameid = window.location.pathname.replace('/newgame/', '');
	gameid = gameid.replace('/', '');
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


	$('#guess').on('submit', function(e){
		e.preventDefault();
		var word = $("[name='word']").val(); //what the player entered to try
		socket.emit('chat message', '<li>' + username + ' guessed the word ' + word + '</li>')
		$.getJSON('/scores/', {'gameid':gameid, 'player' : yo.player, 'word' : word}, function(data) {
			if (data.answer == 'Correct') {
				socket.emit('chat message', '<li class="correct">' + username + ' was correct</li>');
				$('body').trigger('updateScores');
			}
			else if (data.answer == 'Wrong') {
				socket.emit('chat message', '<li class="wrong">' + username + ' was wrong</li>');
			};
			if (data.winner == true) {
				$('body').trigger('gameOver');
			};
		});
		$('[name=word]').val('');
		$('body').trigger('changePlayer');
	});


	$("body").on('nextStep', function(){
		$.getJSON("/findcurrentplayer/", {'gameid' : gameid }, function(data){
			socket.emit('nextPlayer', data.username + "'s turn!");
			if (username != data.username){
				$('[type=submit]').attr('disabled', 'disabled');
			};
			$('body').trigger('foundWords');
		});
	});
	$('body').on('foundWords', function() {
		$.getJSON("/updateFoundWords/", {'gameid' : gameid }, function(data){
			if (data.length > 0){
				socket.emit('updateFoundWords', data);
			};
			$('body').trigger('updateScores');
		});
	});
	$("body").on('changePlayer', function() {
		$.getJSON("/changecurrentplayer/", {'gameid' : gameid, 'players' : players}, function(data) {
			socket.emit('nextPlayer', data.username + "'s turn!");
			socket.emit('checkStatus', data.username);
		});
	});
    $('#chat').on('submit', function(){
        socket.emit('chat message', '<li>' + username + ': ' + $('#m').val() + '</li>');
    $('#m').val('');
        return false;
    });
	$('body').on('checkStatus', function() {
		if (username != yo.msg){
			$('[type=submit]').attr('disabled', 'disabled');
		}
		else {
			$('[type=submit]').removeAttr('disabled');
		};
	});
	$("body").on('gameOver', function() {
		$.getJSON("/winner/", {'gameid' : gameid, 'players' : players}, function(data) {
			yo.winner = data.winner;
			socket.emit('endgame', yo.winner);
		});
	});
	$("body").on('updateScores', function() {
		$.getJSON("/updateScores/", {'gameid' : gameid}, function(data) {
			if (data.scores.length > 0){
				socket.emit('scores', data.scores);
			};
		});
	});	
	$('body').on('endgame', function() {
		$('[type=submit]').attr('disabled', 'disabled');
		$('#status').html(yo.winner + ' wins!');
	});

	$(window).on('unload', function () {
		socket.emit('loggedout', username + ' has logged out');
	});
	socket.on('updateFoundWords', function(msg) {
		if ($('#guesses ul').html() == "No Words Found Yet"){
			$('#guesses ul').html('<li>'+msg+'</li>');
		}
	});
	socket.on('chat message', function(msg){
        $('#messages').append($(msg));
        $('#messages').scrollTop(99999999999999999999999999999);
    });
	socket.on('endgame', function(msg) {
		yo.winner = msg;
		$('body').trigger('endgame');
	});
	socket.on('loggedin', function(msg) {
		$('#messages').append($('<li>').text(msg));
	});
	socket.on('loggedout', function(msg) {
		$('#messages').append($('<li>').text(msg));
	});
	socket.on('checkStatus', function(msg) {
		yo.msg = msg;
		$('body').trigger('checkStatus');
	});
	socket.on('nextPlayer', function(msg) {
		$('#gameArea p').html(msg);
	});
	socket.on('scores', function(msg) {
		$('#scores p').html(msg);
	})


});




