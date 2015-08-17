function randomNumber(){
	var number = []
	for (i=0; i<10; i++){
		var randomnumber = Math.floor(Math.random()*11);
		number.push(randomnumber);
	};
	return number.join([separator = '']);
};

$(document).ready(function(){
	$('#newGame').on('submit', function(event){
		event.preventDefault();
		var players = $('#players').val();
		window.location.href = '/newgame/'+ randomNumber() + '/' + players;
	});
});



