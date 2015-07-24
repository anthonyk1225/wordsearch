function randomNumber(){
	var number = []
	for (i=0; i<10; i++){
		var randomnumber = Math.floor(Math.random()*11);
		number.push(randomnumber);
	};
	return number.join([separator = ''])
};

function Board(){
	this.board = this.createBoard()
};

Board.prototype.createBoard = function(){
	var grid = [];
	var final_grid = [];
	var letters = ['A','B','C','D','E','F','G','H','I','J','K',
				'L','M','N','O','P','Q','R','S','T','U','V','W','X',
				'Y','Z'];
	for (i=0; i<255; i++){
		var rand = Math.floor(Math.random() * letters.length);
		grid.push(letters[rand]);
	};
	for (i=1; i<16; i++){
		var entry = grid.slice(i*15,(i*15)+15);
		v-ar entry = [entry.join('')];
		final_grid.push({'letters' : entry });

	};
	return final_grid;
};

Board.prototype.findWords = function(){
	null
};

Board.prototype.parseThrough = function(){
	null
};

$(document).ready(function(){
	var newGame = new Board;
	var gameBoard = newGame.createBoard();
	for (i=0; i<15; i++){
		$('#gameGrid').append('<p class=gridLetters>'+gameBoard[i]['letters']+'</p>');
	};
	$('#newGame').on('submit', function(event){
		event.preventDefault();
		window.location.href = '/newgame/'+randomNumber();
	});
});



