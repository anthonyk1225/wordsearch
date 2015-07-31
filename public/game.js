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

$(document).ready(function(){
	yo = new Players; // instantiate a new instance of Players
	var pathname = window.location.pathname; //pathname that holds # of players
	var players = pathname[parseInt(pathname.length - 1)]; // number of players
	for (i=0; i<=players; i++){ //append a score of 0 but add each player to the object
		yo.playerScores[i] = i;
	};
	var answers = $('#combos p').html(); //create a variable of all the words in the grid
	$('#gameArea p').html('Player ' + yo.currentPlayer + ' go!');	

	$('#guess').on('submit', function(e){
		e.preventDefault();
		var word = $("[name='word']").val(); //what the player entered to try
		var match = answers.indexOf(word.toLowerCase()); // will return -1 if not found else returns the index
		if (match != -1){
			yo.playerScores[this.currentPlayer] += 1;
			$('#status').html('Correct!');
			yo.addScore( yo.currentPlayer)
		}
		else {
			$('#status').html('Wrong!');
		};
		yo.nextPlayer(players);
		$('#gameArea p').html('Player ' + yo.currentPlayer);
	});
});




