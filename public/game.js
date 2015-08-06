function Players(){
	this.player = null; // will hold the number the player is
	this.msg = '';
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
		var match = answers.indexOf(word.toLowerCase()); // will return -1 if not found else returns the index
		var add = 1
		if (match == -1){
			var add = 0;
		};
		if (match != -1) {
				socket.emit('correctAnswer', 'Correct!');
			}
		else{
			socket.emit('wrongAnswer', 'wrong');
		};
		$.getJSON('/scores/', {'gameid':gameid, 'player' : yo.player, 'add' : add, 'word' : word}, function(data) {
			
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

	socket.on('checkStatus', function(msg) {
		yo.msg = msg
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




