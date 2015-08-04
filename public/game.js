function Players(){
	this.currentPlayer = 1;
	this.playerScores = {};
};

Players.prototype.nextPlayer = function( totalPlayers ) {
	if (this.currentPlayer != totalPlayers) {
		this.currentPlayer += 1;
	}
	else {
		this.currentPlayer = 1;
	};
};

Players.prototype.addScore = function( player ) {
	this.playerScores[player] += 1;
};

Players.prototype.gameOver = function( answers ) {
	if (answers.length == 0){
		return true
	};
	return false
};

Players.prototype.winner = function ( players ){
	var winnerScore = { 'player' : 0 } // a object with the top player's score
	var winner = '' // the player who is high score
	for (i = 1; i <= players; i++){ //for index in list of all the players
		if (this.playerScores[i] > winnerScore.player){ 
			winnerScore.player = this.playerScores[i];
			winner = i
		};
	};
	return winner	
};

$(document).ready(function(){
	var username = prompt('What is your name?');
    var socket = io.connect();

	yo = new Players; // instantiate a new instance of Players
	var pathname = window.location.pathname; //pathname that holds # of players
	var players = pathname[parseInt(pathname.length - 1)]; // number of players
	for (i=1; i<=players; i++){ //append a score of 0 but add each player to the object
		yo.playerScores[i] = 0;
	};
	var answers = $('#combos p').html().split(','); //create a variable of all the words in the grid
	$('#gameArea p').html('Player ' + yo.currentPlayer + ' go!');	


    $('#chat').on('submit', function(){
        socket.emit('chat message', username + ': ' + $('#m').val());
    $('#m').val('');
        return false;
    });

    socket.on('chat message', function(msg){
    	console.log(msg)
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
				$('#scores p').append('Player ' + winner + ' wins!');
				$('[type=submit]').attr('disabled', 'disabled')
			}
		}
		else {
			socket.emit('wrongAnswer', 'wrong');
		};

		$('[name=word]').val('');
		yo.nextPlayer(players);
		socket.emit('nextPlayer', 'Player ' + yo.currentPlayer + ' go!');
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




