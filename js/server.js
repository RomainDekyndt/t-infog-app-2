var http = require('http');

httpServer = http.createServer(function(req, res){
	res.end('Hello world!');
})

	users = {};
	var players = [];
	var nbr = 1;

httpServer.listen(1337);


// on ajoute socket.io et on écoute les connections qui se font sur le serveur
var io = require('socket.io').listen(httpServer);


var nsp = io.of('/my-namespace');

nsp.on('connection', function(socket){
  console.log('someone connected');
});


var roomNbr = 0;
var oneOfTwo = true;


// pour ecouter quand il y a une connection sur une des socket
io.sockets.on('connection', function(socket){






	
	socket.on('new user', function(data, callback){
		if (data in users){
			callback(false);
		} else{
			callback(true);
			socket.nickname = data;
			users[socket.nickname] = socket;
			updateNicknames();
		}
	});


	function updateNicknames(){
		io.sockets.emit('usernames', Object.keys(users));
	}

	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		delete users[socket.nickname];
		updateNicknames();
	});




	socket.on('userLinkcliqued', function(catchClass, userThatClicked){

		userList = Object.keys(users);
		io.sockets.emit('retourUserLinkcliqued', userList, catchClass, userThatClicked);



	});


	socket.on('disablePlayers', function(userPointed, userThatClicked){

		delete users[userPointed];
		delete users[userThatClicked];
		updateNicknames();

	});


	socket.on('ablePlayers', function(me, myPartner){


	users[me] = socket;
	users[myPartner] = socket;
	updateNicknames();

});







/*

	Système de rooms

*/


	socket.on('joinRoom', function(userThatClicked, userPointed){

		// qui compte que quand il y a deux utilisateurs dans la room on change le numéro pour passer à la room suivante
		if (oneOfTwo) {
			roomNbr++;
			oneOfTwo = false;
		} else {
			oneOfTwo = true;
		}

		socket.join("room"+roomNbr);
		io.to("room"+roomNbr).emit('giveMyRoomNbr', roomNbr);


	});








	socket.on('declinePlayRequest', function(myRoomNbr, userThatDeclined){
		io.to("room"+myRoomNbr).emit('resetRoomNbr', myRoomNbr);

		io.to("room"+myRoomNbr).emit('hideWaitingMessage', userThatDeclined);

		socket.leave("room"+myRoomNbr);
	});









	// $ici pour demarrer autre chose que le tapgame
	socket.on('acceptPlayRequest', function(myRoomNbr){
		


		//io.to("room"+myRoomNbr).emit('launchtapGame', myRoomNbr);

		io.to("room"+myRoomNbr).emit('launchExperienceChoice', myRoomNbr);		




		//console.log("launch something");
	});





















	socket.on('exp1Choosed', function(myRoomNbr){
		


		io.to("room"+myRoomNbr).emit('launchtapGame', myRoomNbr);


	});










/*

	tapGame1

*/


// launch game1

	socket.on('linkToStartTheGame1Cliqued', function(myRoomNbr, nameOfTheOneReady){

		io.to("room"+myRoomNbr).emit('aPlayerIsReadyForG1', nameOfTheOneReady);

	})


	socket.on('playersAreReadyForG1', function(myRoomNbr){

		io.to("room"+myRoomNbr).emit('closeLaunchPanelG1');

	})

// the game1

	socket.on('tapZoneG1Cliqued', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('moveTheballG1');
	})


	socket.on('endOfG1', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('displayEndGamePanelG1');
	})



	socket.on('G1restartGameCliqued', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('restartGame1');
	})



/*

	Close tapGame1 and launch tapGame2

*/


	socket.on('G1NextGameCliqued', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('moveToGame2');
	})





// launch game2

	socket.on('linkToStartTheGame2Cliqued', function(myRoomNbr, nameOfTheOneReady){

		io.to("room"+myRoomNbr).emit('aPlayerIsReadyForG2', nameOfTheOneReady);

	})


	socket.on('playersAreReadyForG2', function(myRoomNbr){

		io.to("room"+myRoomNbr).emit('closeLaunchPanelG2');

	})



// the game2


	socket.on('tapZoneG2Cliqued', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('moveTheballG2');
	})


	socket.on('Game2IsOver', function(myRoomNbr, resultGame2){
		
		io.to("room"+myRoomNbr).emit('displayResultAndStopG2', resultGame2);
	})




	socket.on('G2restartGameCliqued', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('restartGame2');
	})









/*

	Close tapGame2 and launch tapGame3

*/


	socket.on('G2NextGameCliqued', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('moveToGame3');
	})




// launch game3

	socket.on('linkToStartTheGame3Cliqued', function(myRoomNbr, nameOfTheOneReady){

		io.to("room"+myRoomNbr).emit('aPlayerIsReadyForG3', nameOfTheOneReady);

	})


	socket.on('playersAreReadyForG3', function(myRoomNbr){

		io.to("room"+myRoomNbr).emit('closeLaunchPanelG3');

	})







// the game3


	socket.on('tapZoneG3Cliqued', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('moveTheballG3');
	})


	socket.on('Game3IsOver', function(myRoomNbr, resultGame2){
		
		io.to("room"+myRoomNbr).emit('displayResultAndStopG3', resultGame2);
	})




	socket.on('G3restartGameCliqued', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('restartGame3');
	})




















/*

	Close tapGame3 and launch tapGame4

*/


	socket.on('G3NextGameCliqued', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('moveToGame4');
	})




// launch game4

	socket.on('linkToStartTheGame4Cliqued', function(myRoomNbr, nameOfTheOneReady){

		io.to("room"+myRoomNbr).emit('aPlayerIsReadyForG4', nameOfTheOneReady);

	})


	socket.on('playersAreReadyForG4', function(myRoomNbr){

		io.to("room"+myRoomNbr).emit('closeLaunchPanelG4');

	})







// the game4


	socket.on('tapZoneG4Cliqued', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('moveTheballG4');
	})


	socket.on('Game4IsOver', function(myRoomNbr, resultGame2){
		
		io.to("room"+myRoomNbr).emit('displayResultAndStopG4', resultGame2);
	})




	socket.on('G4restartGameCliqued', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('restartGame4');
	})








/*
________________________________________________
	finalGame
________________________________________________

*/




	socket.on('G4NextGameCliqued', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('moveToFinalGame');
	})






// Don't play finalGame


	socket.on('dontFightLinkCliqued', function(myRoomNbr, playerThatRefuseToFight, playerThatMaybeWouldFight){

		io.to("room"+myRoomNbr).emit('openRefuseToPlayPanel',playerThatRefuseToFight, playerThatMaybeWouldFight);

	})










// launch FinalGame

	socket.on('linkToStartTheFinalGameCliqued', function(myRoomNbr, nameOfTheOneReady){

		io.to("room"+myRoomNbr).emit('aPlayerIsReadyForFinalGame', nameOfTheOneReady);

	})


	socket.on('playersAreReadyForFinalGame', function(myRoomNbr){

		io.to("room"+myRoomNbr).emit('closeLaunchPanelFinalGame');

	})



	socket.on('playersAreReadyForFinalGame', function(myRoomNbr){

		io.to("room"+myRoomNbr).emit('closeLaunchPanelFinalGame');
	})




	socket.on('tapZoneFinalGameCliqued', function(myRoomNbr, playerNbr){

		io.to("room"+myRoomNbr).emit('moveTheBallFinalGame', playerNbr);

	})


	socket.on('endOfFinalGame', function(myRoomNbr){

		io.to("room"+myRoomNbr).emit('displayEndGamePanelFinalGame');

	})

	socket.on('restartGaleFinalGameCliqued', function(myRoomNbr){

		io.to("room"+myRoomNbr).emit('restartFinalGame');

	})








/*
________________________________________________
	exp2
________________________________________________

*/



	socket.on('linkToExp2Cliqued', function(myRoomNbr){

		io.to("room"+myRoomNbr).emit('launchExp2');

	})

	socket.on('exp2Choosed', function(myRoomNbr){

		io.to("room"+myRoomNbr).emit('launchExp2');

	})






	socket.on('linkLaunchDrawExpClicked', function(myRoomNbr){

		io.to("room"+myRoomNbr).emit('launchDrawingExp');


	})





/*

	drawingExperience

*/


	socket.on('pass', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('retour');

	})











/*
________________________________________________

*/



	socket.on('linkToExp3Cliqued', function(myRoomNbr){
		io.to("room"+myRoomNbr).emit('launchExp3');

	})



	socket.on('tempoLinkToMenuCliqued', function(myRoomNbr, me, myPartner){

		users[me] = socket;
		users[myPartner] = socket;
		updateNicknames();
		io.to("room"+myRoomNbr).emit('backToMenu');

	})







































/*

	Helpers button

*/




	socket.on('plumEvent', function(data){
		console.log(socket.nickname);





		io.sockets.emit('retourPlumEvent', roomNbr);
	});



	socket.on('blueEvent', function(myRoomNbr){

		io.sockets.emit('retourBlueEvent');

	});













/*

	touchExperience

*/




	socket.on('touchSurfaceCliqued', function(positionX, positionY, myRoomNbr){

		socket.broadcast.to("room"+myRoomNbr).emit('displayRound', positionX, positionY);

	})


	socket.on('touchSurfaceReleased', function(myRoomNbr){

		socket.broadcast.to("room"+myRoomNbr).emit('releaseRound');
	})




/*

	Launch gaming push

*/


	socket.on('linkGamingPushCliqued', function(myRoomNbr){

		io.to("room"+myRoomNbr).emit('launchGamingPush', myRoomNbr);

	})









/*

	Gaming push

*/


// PLAYERS

	players.push("player"+nbr);




// GAME

	var positionHorse1 = 0;
	var positionHorse2 = 0;


	socket.on('pushButton1', function(){
			positionHorse1 -= 100;


			if(positionHorse2 < -700) {
				console.log("c'est fini..");
			} else if (positionHorse1 > -800) {
				io.sockets.emit('movingHorse1', positionHorse1);
			} else {
				console.log("Horse 1 gagne !");
				winnerName = "horse1";
				io.sockets.emit('stopGamingPush', winnerName);
			}

	});

	socket.on('pushButton2', function(){
			positionHorse2 -= 100;

			if(positionHorse1 < -700) {
				console.log("c'est fini..");
			} else if (positionHorse2 > -800) {
				io.sockets.emit('movingHorse2', positionHorse2);
			} else {
				console.log("Horse 2 gagne !");
				winnerName = "horse2";
				io.sockets.emit('stopGamingPush', winnerName);				
			}

	});



	socket.on('youWinAcceptCliqued', function(){
		io.sockets.emit('closeGamingPush');				

	})
















/*

____________________________________________________

Interaction Moment website

____________________________________________________


*/




	socket.on('momentWebsiteCliqued', function(positionX, positionY){

		socket.broadcast.emit('displayRoundMW', positionX, positionY);


	})


	socket.on('momentWebsiteReleased', function(){

		socket.broadcast.emit('releaseRoundMW');
	})




























































});
// fin de l'écoute de la connection socket







