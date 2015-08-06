function Players(){
	this.currentPlayer = null; // holds current player to check if its their turn
	this.playerScores = null; // holds all the scores for each player
	this.player = null; // will hold the number the player is
};

$(document).ready(function(){
	var username = prompt('What is your name?');
    var socket = io.connect();

	var pathname = window.location.pathname; //pathname that holds # of players
	var players = pathname[parseInt(pathname.length - 1)]; // number of players

	var answers = $('#combos p').html().split(','); //create a variable of all the words in the grid

	var gameid = window.location.pathname.replace('/newgame/', '');
	var gameid = gameid.replace('/', '');

	yo = new Players

	$.getJSON("/playerassignment/", {'gameid' : gameid, 'username' : username, 'players' : players}, function(data) {
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
		$.getJSON("/currentplayer/", {'gameid' : gameid }, function(data){
			yo.currentPlayer = data;
			$('body').trigger('currentplayer');	
			if (username != yo.currentPlayer.username){
				$('[type=submit]').attr('disabled', 'disabled');
			}
		});
	});

	$("body").on('currentplayer', function(){
		console.log(yo.currentPlayer)
		$('#gameArea p').html(yo.currentPlayer.username + "'s turn!");
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
		var match = answers.indexOf(word.toLowerCase()); // will return -1 if not found else returns the index
		if (match != -1){
			yo.playerScores[this.currentPlayer] += 1;
			socket.emit('correctAnswer', 'Correct!');
			yo.addScore( yo.currentPlayer);
			answers.splice(match, 1);
			if (yo.gameOver(answers) === true){
				var winner = yo.winner( players );
				$('#scores p').append(winner + ' wins!');
				$('[type=submit]').attr('disabled', 'disabled')
			}
		}
		else {
			socket.emit('wrongAnswer', 'wrong');
		};

		$('[name=word]').val('');
		yo.nextPlayer(players);
		socket.emit('nextPlayer', yo.currentPlayer.username + "'s turn!");
		// $('#scores p').append(yo.playerScores[1]);
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




