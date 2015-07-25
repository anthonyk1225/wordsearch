function randomNumber(){
	var number = []
	for (i=0; i<10; i++){
		var randomnumber = Math.floor(Math.random()*11);
		number.push(randomnumber);
	};
	return number.join([separator = ''])
};

$(document).ready(function(){
	var board = []
	var newGame = new Board;
	var gameBoard = newGame.createBoard();
	for (i=0; i<15; i++){
		board.push(gameBoard[i]['letters'][0])
		$('#gameGrid').append('<p class=gridLetters>'+gameBoard[i]['letters']+'</p>');
	};
	$('#newGame').on('submit', function(event){
		event.preventDefault();
		window.location.href = '/newgame/'+randomNumber();
	});
	newGame.parseThrough(board)
});



