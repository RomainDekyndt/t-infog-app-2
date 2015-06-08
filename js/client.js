//pour attendre que jQuery soit bien chargé
(function($){


	//HEAJ
	//var socket = io.connect('http://10.0.3.211:1337');

	//local
	var socket = io.connect('http://localhost:1337');

	//Serveur Gandi
	//var socket = io.connect('http://www.romaindekyndt.me');



	

	var clickOrTouch = "touchstart";

	var $nickForm = $('#setNick');
	var $nickError = $('#nickError');
	var $nickBox = $('#nickname');
	var $users = $('#users');
	var $messageForm = $('#send-message');
	var $messageBox = $('#message');
	var $chat = $('#chat');

	var me;
	var userPointed;
	
	var playerNbr;
	var user1 = "user1";
	var user2 = "user2";
	var myPartner;

	// Default = 1
	var	speedOfMyBall = 30;


	var userThatClicked = "";
	var myRoomNbr = 0;




	//soumission du formulaire d'inscription
		//$nickForm.submit(function(e){

	$nickForm.on("submit", function(e){

		e.preventDefault();
		socket.emit('new user', $nickBox.val(), function(data){
			if(data){
				$('#nickWrap').hide();
			} else{
				$nickError.html('Ce nom d\'utilisateur est déjà pris. Réessayez ! ;)');
			}
		});
		me = $nickBox.val();
		$nickBox.val('');			

	});




	// affiche la liste des utilisateurs
	socket.on('usernames', function(data){
		var html = '';
		for(i=0; i < data.length; i++){
			html += '<li><a href="#" class="'+"userLink"+" "+ 'user__'+ data[i] +'">'+data[i] + '</a></li>'
		}
		$('#users ul').html(html);

		$('ul li a.user__'+me).hide();

	});
	












// fonction qui récupère le nom d'utilisateur dans la classe
function cleanClass(classToCLean){
		classToCLean = classToCLean.split(' ');
		classToCLean = classToCLean[1];
		classToCLean = classToCLean.split('__');
		classToCLean = classToCLean[1];
		return classToCLean;
}




	$( "body" ).on(clickOrTouch, ".userLink", function() {

		var catchClass = $(this).attr('class');

		userThatClicked = me;
		socket.emit('userLinkcliqued', catchClass, userThatClicked)

	});



	socket.on('retourUserLinkcliqued', function(userList, catchClass, userThatClicked){

		userPointed = cleanClass(catchClass);

		if (me == userPointed) {
			// envoyer la demande
			$('.askToPlay').css ({"display" : "block"})
			$('.askToPlayQuestion strong').text(userThatClicked);

			playerNbr = user2;
			myPartner = userThatClicked;

		}

		// Ajouter une fenêtre d'attente d'acceptation
		 if (me == userThatClicked) {
			$('.waitAnswerToPlay').css ({"display" : "block"})
			$('.waitAnswerToPlayMessage strong').text(userPointed);

			playerNbr = user1;
			myPartner = userPointed;

		 }



		if (me == userPointed || me == userThatClicked) {
			socket.emit('joinRoom', userThatClicked, userPointed)
		}



		socket.emit('disablePlayers', userPointed, userThatClicked)



	});





	$( ".askToPlay" ).on(clickOrTouch, ".yesToPlay", function() {
		$('.askToPlay').css ({"display" : "none"})
		socket.emit('acceptPlayRequest', myRoomNbr);
	})



	$( ".askToPlay" ).on(clickOrTouch, ".noToPlay", function() {
		$('.askToPlay').css ({"display" : "none"})

		var userThatDeclined = me;

		socket.emit('declinePlayRequest', myRoomNbr, userThatDeclined);


		socket.emit('ablePlayers', me, myPartner)

	})







	socket.on('hideWaitingMessage', function(){
		$('.waitAnswerToPlay').css ({"display" : "none"})

		if (me == userThatClicked){
			$('.heDeclinedToPlay strong.strongRed').html(myPartner);

			$('.heDeclinedToPlay').css ({"display" : "block"})

		}
	})

	$( ".heDeclinedToPlay" ).on(clickOrTouch, ".imSad", function() {
		$('.heDeclinedToPlay').fadeOut();
	})






	socket.on('resetRoomNbr', function(){
		myRoomNbr = 0;
	})




	socket.on('giveMyRoomNbr', function(roomNbr){
		myRoomNbr = roomNbr;
		//console.log("je suis dans la room "+myRoomNbr);
	});





	socket.on('launchExperienceChoice', function(myRoomNbr){

		$('.waitAnswerToPlay').css ({"display" : "none"})

		$('.experienceChoice').css({
			"display" : "block",
			"left" : 0
		})
	})



	$( ".experienceChoice" ).on(clickOrTouch, ".chooseExp1", function() {

		socket.emit('exp1Choosed', myRoomNbr);

	})


	$( ".experienceChoice" ).on(clickOrTouch, ".chooseExp2", function() {

		socket.emit('exp2Choosed', myRoomNbr);

	})





















	socket.on('launchtapGame', function(myRoomNbr){

		$('.waitAnswerToPlay').css ({"display" : "none"})

		$('.waitingForMyPartner strong').html(myPartner);


		$('.experienceChoice').css({
			"display" : "none"
		})


		$('.tapGame1').css({
			"display" : "block",
			"left" : 0
		})
	})





var ballUserPositionDefault = 95;
var ballUserPosition = ballUserPositionDefault;






var partnerIsReadyForG1 = false;


/*

	Launch tapGame1

*/



	$( ".tapGame1" ).on(clickOrTouch, ".linkToStartTheGame", function() {
		$(".tapGame1 .linkToStartTheGame").html('Prêt'+'<span class="tick"></span>')
		$(".tapGame1 .linkToStartTheGame").css({
			"background" : "#768EFF"
		})
		$(".tapGame1 .linkToStartTheGame span.tick").css({
			"display" : "block"
		})

		var nameOfTheOneReady = me;

		socket.emit('linkToStartTheGame1Cliqued', myRoomNbr, nameOfTheOneReady);
	});


	socket.on('aPlayerIsReadyForG1', function(nameOfTheOneReady){

		if (partnerIsReadyForG1) {
			socket.emit('playersAreReadyForG1', myRoomNbr);
		}
		if (me != nameOfTheOneReady){
			$('.tapGame1 .waitingForMyPartner').html(
				"<span><strong>"+nameOfTheOneReady+"</strong> est prêt"+"<span class=\"tick\"></span></span>"
			);
			$('.tapGame1 .waitingForMyPartner').css({
				"color" : "#768EFF"
			})
			$('.tapGame1 .waitingForMyPartner span.tick').css({
				"display" : "block"
			})
			partnerIsReadyForG1 = true;
		}


	})


	socket.on('closeLaunchPanelG1', function(nameOfTheOneReady){
		restaureGame1();
		$('.tapGame1 .launchPanel').css({
			"display" : "none"
		})
		partnerIsReadyForG1 = false;
	})





/*

	tapGame1

*/



	$( ".tapGame1" ).on(clickOrTouch, ".tapZone", function() {

		socket.emit('tapZoneG1Cliqued', myRoomNbr);

	})


	socket.on('moveTheballG1', function(){

		if (ballUserPosition > 10){

			$('.tapGame1 .ballUser').css({
				"top" : "calc("+ ballUserPosition +"% - 60px)"
			})
			ballUserPosition = ballUserPosition - speedOfMyBall;

		} else {
			$('.tapGame1 .ballUser').css({
				"top" : 0
			})

			socket.emit('endOfG1', myRoomNbr);

		}



	})




	socket.on('displayEndGamePanelG1', function(){
		$('.tapGame1 .endGamePanel').css({
			"display" : "block"
		})

	})




	$( ".tapGame1" ).on(clickOrTouch, ".restartGame", function() {

		socket.emit('G1restartGameCliqued', myRoomNbr);
	});


	socket.on('restartGame1', function(){

		restaureGame1();
		$('.tapGame1 .endGamePanel').css({
			"display" : "none"
		})

	})



	function restaureGame1(){
		ballUserPosition = ballUserPositionDefault;

		$('.tapGame1 .ballUser').css({
			"top" : "calc("+100+"% - 60px)"
		})	
	}





/*

	Close tapGame1 and launch tapGame2

*/

	$( ".tapGame1" ).on(clickOrTouch, ".nextGame", function() {

		socket.emit('G1NextGameCliqued', myRoomNbr);
	});


	socket.on('moveToGame2', function(){

		restaureGame1();
		$('.tapGame1').css({
			"display" : "none"
		})

		$('.tapGame1 .endGamePanelWindow').css({
			"display" : "none"
		})		

		$('.tapGame1 .launchPanel').css({
			"display" : "block"
		})	

		// ajouter un restaureGame2() plus tard
		$('.tapGame2').css({
			"display" : "block"
		})

	})





// launch Game2

var partnerIsReadyForG2 = false;


	$( ".tapGame2" ).on(clickOrTouch, ".linkToStartTheGame", function() {
		$(".tapGame2 .linkToStartTheGame").html('Prêt'+'<span class="tick"></span>')
		$(".tapGame2 .linkToStartTheGame").css({
			"background" : "#768EFF"
		})
		$(".tapGame2 .linkToStartTheGame span.tick").css({
			"display" : "block"
		})

		var nameOfTheOneReady = me;

		socket.emit('linkToStartTheGame2Cliqued', myRoomNbr, nameOfTheOneReady);
	});


	socket.on('aPlayerIsReadyForG2', function(nameOfTheOneReady){

		if (partnerIsReadyForG2) {
			socket.emit('playersAreReadyForG2', myRoomNbr);
		}
		if (me != nameOfTheOneReady){
			$('.tapGame2 .waitingForMyPartner').html(
				"<span><strong>"+nameOfTheOneReady+"</strong> est prêt"+"<span class=\"tick\"></span></span>"
			);
			$('.tapGame2 .waitingForMyPartner').css({
				"color" : "#768EFF"
			})
			$('.tapGame2 .waitingForMyPartner span.tick').css({
				"display" : "block"
			})		
			partnerIsReadyForG2 = true;
		}


	})


	socket.on('closeLaunchPanelG2', function(nameOfTheOneReady){
		restaureGame1();
		$('.tapGame2 .launchPanel').css({
			"display" : "none"
		})
		partnerIsReadyForG2 = false;
		game2IsRunning = true;
		botG2();


	})




var botTimeG2 = 7.5;
var botTimeG2MS = botTimeG2 * 1000;
var game2IsRunning = false;
var resultGame2;
var chronoG2;

function botG2(){

		chronoG2 = setTimeout(function(){		
			resultGame2 = "loose";

			socket.emit('Game2IsOver', myRoomNbr, resultGame2);
		},botTimeG2MS)
				

		$('.tapGame2 .ballBot').addClass('bot-animation')

		$('.tapGame2 .bot-animation').css({
			"-webkit-animation-duration" : botTimeG2 +"s",
		})


}




	$( ".tapGame2" ).on(clickOrTouch, ".tapZone", function() {

		socket.emit('tapZoneG2Cliqued', myRoomNbr);

	})


	socket.on('moveTheballG2', function(){

		if (game2IsRunning) {
			if (ballUserPosition > 10){

				$('.tapGame2 .ballUser').css({
					"top" : "calc("+ ballUserPosition +"% - 60px)"
				})
				ballUserPosition = ballUserPosition - speedOfMyBall;

			} else {
				$('.tapGame2 .ballUser').css({
					"top" : 0
				})

				resultGame2 = "win";
				socket.emit('Game2IsOver', myRoomNbr, resultGame2);


			}
		}


	})


	socket.on('displayResultAndStopG2', function(resultGame2){
		game2IsRunning = false;
		clearTimeout(chronoG2);

		$('.tapGame2 .ballBot').removeClass('bot-animation')		
	

		$('.tapGame2 .endGamePanel').css({
			"display" : "block"
		})

		if (resultGame2 == "win") {

			$('.tapGame2 .endGamePanel .winPanel').css({
				"display" : "block"
			})

			$('.tapGame2 .endGamePanel .loosePanel').css({
				"display" : "none"
			})
		} else if (resultGame2 == "loose") {
			$('.tapGame2 .endGamePanel .loosePanel').css({
				"display" : "block"
			})

			$('.tapGame2 .endGamePanel .winPanel').css({
				"display" : "none"
			})

		}



	})





	$( ".tapGame2" ).on(clickOrTouch, ".restartGame", function() {

		socket.emit('G2restartGameCliqued', myRoomNbr);
	});


	socket.on('restartGame2', function(){
		botG2()
		restaureGame2();

		$('.tapGame2 .endGamePanel').css({
			"display" : "none"
		})




	})

	function restaureGame2(){
		ballUserPosition = ballUserPositionDefault;

		$('.tapGame2 .ballUser').css({
			"top" : "calc("+100+"% - 60px)"
		})	


		game2IsRunning = true;

	}















/*

	Close tapGame2 and launch tapGame3

*/

	$( ".tapGame2" ).on(clickOrTouch, ".nextGame", function() {

		socket.emit('G2NextGameCliqued', myRoomNbr);
	});


	socket.on('moveToGame3', function(){

		restaureGame2();
		$('.tapGame2').css({
			"display" : "none"
		})

		$('.tapGame3').css({
			"display" : "block"
		})

	})



// launch Game3

var partnerIsReadyForG3 = false;


	$( ".tapGame3" ).on(clickOrTouch, ".linkToStartTheGame", function() {
		$(".tapGame3 .linkToStartTheGame").html('Prêt'+'<span class="tick"></span>')
		$(".tapGame3 .linkToStartTheGame").css({
			"background" : "#768EFF"
		})
		$(".tapGame3 .linkToStartTheGame span.tick").css({
			"display" : "block"
		})

		var nameOfTheOneReady = me;

		socket.emit('linkToStartTheGame3Cliqued', myRoomNbr, nameOfTheOneReady);
	});


	socket.on('aPlayerIsReadyForG3', function(nameOfTheOneReady){

		if (partnerIsReadyForG3) {
			socket.emit('playersAreReadyForG3', myRoomNbr);
		}
		if (me != nameOfTheOneReady){
			$('.tapGame3 .waitingForMyPartner').html(
				"<span><strong>"+nameOfTheOneReady+"</strong> est prêt"+"<span class=\"tick\"></span></span>"
			);
			$('.tapGame3 .waitingForMyPartner').css({
				"color" : "#768EFF"
			})
			$('.tapGame3 .waitingForMyPartner span.tick').css({
				"display" : "block"
			})				
			partnerIsReadyForG3 = true;
		}


	})


	socket.on('closeLaunchPanelG3', function(nameOfTheOneReady){
		restaureGame2();
		$('.tapGame3 .launchPanel').css({
			"display" : "none"
		})
		partnerIsReadyForG3 = false;
		game3IsRunning = true;

		botG3();




	})



var botTimeG3 = 6.5;
var botTimeG3MS = botTimeG3 * 1000;
var game3IsRunning = false;
var resultGame3;
var chronoG3;

function botG3(){

		chronoG3 = setTimeout(function(){		
			resultGame3 = "loose";

			socket.emit('Game3IsOver', myRoomNbr, resultGame3);
		},botTimeG3MS)


		$('.tapGame3 .ballBot').addClass('bot-animation')

		$('.tapGame3 .bot-animation').css({
			"-webkit-animation-duration" : botTimeG2 +"s",
		})



}




	$( ".tapGame3" ).on(clickOrTouch, ".tapZone", function() {

		socket.emit('tapZoneG3Cliqued', myRoomNbr);

	})


	socket.on('moveTheballG3', function(){

		if (game3IsRunning) {
			if (ballUserPosition > 10){

				$('.tapGame3 .ballUser').css({
					"top" : "calc("+ ballUserPosition +"% - 60px)"
				})
				ballUserPosition = ballUserPosition - speedOfMyBall;

			} else {
				$('.tapGame3 .ballUser').css({
					"top" : 0
				})

				resultGame3 = "win";
				socket.emit('Game3IsOver', myRoomNbr, resultGame3);

				//socket.emit('endOfG3', myRoomNbr);

			}
		}


	})


	socket.on('displayResultAndStopG3', function(resultGame3){
		game2IsRunning = false;
		clearTimeout(chronoG3);

		$('.tapGame3 .ballBot').removeClass('bot-animation')


		$('.tapGame3 .endGamePanel').css({
			"display" : "block"
		})

		if (resultGame3 == "win") {

			$('.tapGame3 .endGamePanel .winPanel').css({
				"display" : "block"
			})

			$('.tapGame3 .endGamePanel .loosePanel').css({
				"display" : "none"
			})
		} else if (resultGame3 == "loose") {
			$('.tapGame3 .endGamePanel .loosePanel').css({
				"display" : "block"
			})

			$('.tapGame3 .endGamePanel .winPanel').css({
				"display" : "none"
			})

		}



	})





	$( ".tapGame3" ).on(clickOrTouch, ".restartGame", function() {

		socket.emit('G3restartGameCliqued', myRoomNbr);
	});


	socket.on('restartGame3', function(){
		botG3()
		restaureGame3();

		$('.tapGame3 .endGamePanel').css({
			"display" : "none"
		})

		$('.tapGame3 .ballBot').css({
			"top" : "calc(100% - 60px)"
		})	

	})

	function restaureGame3(){
		ballUserPosition = ballUserPositionDefault;

		$('.tapGame3 .ballUser').css({
			"top" : "calc("+100+"% - 60px)"
		})	


		game3IsRunning = true;

	}












/*

	Close tapGame3 and launch tapGame4

*/

	// $( ".tapGame3" ).on(clickOrTouch, ".nextGame", function() {
	// 	socket.emit('G3NextGameCliqued', myRoomNbr);
	// });



/*

	EN FAIT JE NE MET PAS LE TAPGAME3
	(pour le remettre decommenter ci dessus)

*/

	$( ".tapGame3" ).on(clickOrTouch, ".nextGame", function() {
		socket.emit('G4NextGameCliqued', myRoomNbr);
	});





	socket.on('moveToGame4', function(){

		restaureGame3();
		$('.tapGame3').css({
			"display" : "none"
		})

		$('.tapGame4').css({
			"display" : "block"
		})

	})



// launch Game4

var partnerIsReadyForG4 = false;


	$( ".tapGame4" ).on(clickOrTouch, ".linkToStartTheGame", function() {
		$(".tapGame4 .linkToStartTheGame").html('Prêt'+'<span class="tick"></span>')
		$(".tapGame4 .linkToStartTheGame").css({
			"background" : "#768EFF"
		})
		$(".tapGame4 .linkToStartTheGame span.tick").css({
			"display" : "block"
		})

		var nameOfTheOneReady = me;

		socket.emit('linkToStartTheGame4Cliqued', myRoomNbr, nameOfTheOneReady);
	});


	socket.on('aPlayerIsReadyForG4', function(nameOfTheOneReady){

		if (partnerIsReadyForG4) {
			socket.emit('playersAreReadyForG4', myRoomNbr);
		}
		if (me != nameOfTheOneReady){
			$('.tapGame4 .waitingForMyPartner').html(
				"<span><strong>"+nameOfTheOneReady+"</strong> est prêt"+"<span class=\"tick\"></span></span>"
			);
			$('.tapGame4 .waitingForMyPartner').css({
				"color" : "#768EFF"
			})
			$('.tapGame4 .waitingForMyPartner span.tick').css({
				"display" : "block"
			})				
			partnerIsReadyForG4 = true;
		}


	})


	socket.on('closeLaunchPanelG4', function(nameOfTheOneReady){
		restaureGame4();
		$('.tapGame4 .launchPanel').css({
			"display" : "none"
		})
		partnerIsReadyForG4 = false;
		game4IsRunning = true;

		botG4();

	})



var botTimeG4 = 6.2;
var botTimeG4MS = botTimeG4 * 1000;
var game4IsRunning = false;
var resultGame4;
var chronoG4;

function botG4(){

		chronoG4 = setTimeout(function(){		
			resultGame4 = "loose";

			socket.emit('Game4IsOver', myRoomNbr, resultGame4);
		},botTimeG4MS)

		$('.tapGame4 .ballBot').css({
			"-webkit-animation-name" : "doTheRace",
			"-webkit-animation-duration" : botTimeG4 +"s",
			"-webkit-animation-play-state" : "running"

		})

}




	$( ".tapGame4" ).on(clickOrTouch, ".tapZone", function() {

		socket.emit('tapZoneG4Cliqued', myRoomNbr);

	})


	socket.on('moveTheballG4', function(){

		if (game4IsRunning) {
			if (ballUserPosition > 10){

				$('.tapGame4 .ballUser').css({
					"top" : "calc("+ ballUserPosition +"% - 60px)"
				})
				ballUserPosition = ballUserPosition - speedOfMyBall;

			} else {
				$('.tapGame4 .ballUser').css({
					"top" : 0
				})

				resultGame4 = "win";
				socket.emit('Game4IsOver', myRoomNbr, resultGame4);

				//socket.emit('endOfG4', myRoomNbr);

			}
		}


	})


	socket.on('displayResultAndStopG4', function(resultGame4){
		game4IsRunning = false;
		clearTimeout(chronoG4);

		$('.tapGame4 .ballBot').css({
			"-webkit-animation-play-state" : "paused"
		})

		$('.tapGame4 .ballBot').css({
			"top" : "calc(100%)",
			"background" : "red"
		})	

		$('.tapGame4 .endGamePanel').css({
			"display" : "block"
		})

		if (resultGame4 == "win") {

			$('.tapGame4 .endGamePanel .winPanel').css({
				"display" : "block"
			})

			$('.tapGame4 .endGamePanel .loosePanel').css({
				"display" : "none"
			})
		} else if (resultGame4 == "loose") {
			$('.tapGame4 .endGamePanel .loosePanel').css({
				"display" : "block"
			})

			$('.tapGame4 .endGamePanel .winPanel').css({
				"display" : "none"
			})

		}



	})





	$( ".tapGame4" ).on(clickOrTouch, ".restartGame", function() {

		socket.emit('G4restartGameCliqued', myRoomNbr);
	});


	socket.on('restartGame4', function(){
		botG4()
		restaureGame4();

		$('.tapGame4 .endGamePanel').css({
			"display" : "none"
		})

		$('.tapGame4 .ballBot').css({
			"top" : "calc(100% - 60px)",
			"background" : "red"
		})	

	})

	function restaureGame4(){
		ballUserPosition = ballUserPositionDefault;

		$('.tapGame4 .ballUser').css({
			"top" : "calc("+100+"% - 60px)"
		})	

		gameIsRunning = true;

	}
















/*
________________________________________________
	finalGame
________________________________________________

*/

var playerThatRefuseToFight;
var playerThatMaybeWouldFight;




	$( ".tapGame4" ).on(clickOrTouch, ".nextGame", function() {
		socket.emit('G4NextGameCliqued', myRoomNbr);
	});



	socket.on('moveToFinalGame', function(){

		restaureGame3();
		$('.tapGame4').css({
			"display" : "none"
		})

		$('.finalGame').css({
			"display" : "block"
		})

		$(".finalGame .launchPanel .strongRed").html(myPartner);

	})




// Don't play finalGame

	$( ".finalGame" ).on(clickOrTouch, ".dontFightLink", function() {

		playerThatRefuseToFight = me;
		playerThatMaybeWouldFight = myPartner;

		socket.emit('dontFightLinkCliqued', myRoomNbr, playerThatRefuseToFight, playerThatMaybeWouldFight);

	});





	socket.on('openRefuseToPlayPanel', function(playerThatRefuseToFight, playerThatMaybeWouldFight){

		$('.finalGame .stayFriendsPanel').css({
			"display" : "block"
		})

		if(me == playerThatRefuseToFight){

			$(".finalGame .stayFriendsPanel .iRefusePanel").css({
				"display" : "block"
			})




		} else if (me == playerThatMaybeWouldFight) {

			$(".finalGame .stayFriendsPanel .heRefusePanel").css({
				"display" : "block"
			})

			$(".finalGame .stayFriendsPanel .heRefusePanel .strongRed").html(myPartner)


		}


	})









// launch finalGame

var partnerIsReadyForFinalGame = false;



	$( ".finalGame" ).on(clickOrTouch, ".linkToStartTheGame", function() {
		$(".finalGame .linkToStartTheGame").html('Prêt'+'<span class="tick"></span>')
		$(".finalGame .linkToStartTheGame").css({
			"background" : "#ff8080",
			"color" : "#fff"
		})
		$(".finalGame .linkToStartTheGame span.tick").css({
			"display" : "block"
		})

		var nameOfTheOneReady = me;

		socket.emit('linkToStartTheFinalGameCliqued', myRoomNbr, nameOfTheOneReady);
	});


	socket.on('aPlayerIsReadyForFinalGame', function(nameOfTheOneReady){

		if (partnerIsReadyForFinalGame) {
			socket.emit('playersAreReadyForFinalGame', myRoomNbr);
		}
		if (me != nameOfTheOneReady){
			$('.finalGame .waitingForMyPartner').html(
				"<span><strong>"+nameOfTheOneReady+"</strong> est prêt"+"<span class=\"tick\"></span></span>"
			);
			$('.finalGame .waitingForMyPartner').css({
				"color" : "#768EFF"
			})
			$('.finalGame .waitingForMyPartner span.tick').css({
				"display" : "block"
			})				
			partnerIsReadyForFinalGame = true;
		}


	})


	socket.on('closeLaunchPanelFinalGame', function(nameOfTheOneReady){



		if (playerNbr == user1) {
			$('.finalGame .ballUser1').css({
				"background" : "#768eff",
				"left" : "calc(50% - 10px)"								
			})

			$('.finalGame .ballUser2').css({
				"background" : "#ff8080",
				"opacity" : 1,
  				"left" : "calc(50% - 50px)"		

			})
		};




		if (playerNbr == user2) {
			$('.finalGame .ballUser2').css({
				"background" : "#768eff",
				"opacity" : 1,
				"left" : "calc(50% - 10px)"				
			})

			$('.finalGame .ballUser1').css({
				"background" : "#ff8080",
  				"left" : "calc(50% - 50px)"
			})
		};





		
		$('.finalGame .launchPanel').css({
			"display" : "none"
		})
		
		partnerIsReadyForFinalGame = false;
		finalGameIsRunning = true;





	})










	$( ".finalGame" ).on(clickOrTouch, ".tapZone", function() {


		socket.emit('tapZoneFinalGameCliqued', myRoomNbr, playerNbr);

	})



var finalGameIsRunning = false;
var resultfinalGame;

var ballUser1DefaultPosition = 95;
var ballUser2DefaultPosition = 95;
var ballUser1Position = ballUser1DefaultPosition;
var ballUser2Position = ballUser2DefaultPosition;

var playerThatWin;
var playerThatLoose;


	socket.on('moveTheBallFinalGame', function(playerNbr){


		if (finalGameIsRunning) {
			if (playerNbr == "user1") {
				if (ballUser1Position > 10){

					$('.finalGame .ballUser1').css({
						"top" : "calc("+ ballUser1Position +"% - 60px)"
					})
					ballUser1Position = ballUser1Position - speedOfMyBall;


				} else {
					$('.finalGame .ballUser1').css({
						"top" : 0
					})

					playerThatWin = user1;
					playerThatLoose = user2;
					socket.emit('endOfFinalGame', myRoomNbr);
					finalGameIsRunning = false;

				}

			} 




			else if (playerNbr == "user2") {
				if (ballUser2Position > 10){

					$('.finalGame .ballUser2').css({
						"top" : "calc("+ ballUser2Position +"% - 60px)"
					})
					ballUser2Position = ballUser2Position - speedOfMyBall;

				} else {
					$('.finalGame .ballUser2').css({
						"top" : 0
					})



					playerThatWin = user2;
					playerThatLoose = user1;
					socket.emit('endOfFinalGame', myRoomNbr);
					finalGameIsRunning = false;


				}
			};
		}


	})





	socket.on('displayEndGamePanelFinalGame', function(){

		$('.finalGame .endGamePanel').css({
			"display" : "block"
		})


		if (playerNbr == playerThatWin) {
			$('.finalGame .endGamePanel .winPanel').css({
				"display" : "block"
			})

			$('.finalGame .endGamePanel .winPanel .strongRed').html(myPartner)



		}

		if (playerNbr == playerThatLoose) {
			$('.finalGame .endGamePanel .loosePanel').css({
				"display" : "block"
			})

			$('.finalGame .endGamePanel .loosePanel .strongRed').html(myPartner)

		}


	})





	$( ".finalGame" ).on(clickOrTouch, ".restartGame", function() {

		socket.emit('restartGaleFinalGameCliqued', myRoomNbr);

	})




	socket.on('restartFinalGame', function(){

		finalGameIsRunning = true;
		ballUser1Position = ballUser1DefaultPosition;
		ballUser2Position = ballUser2DefaultPosition;



		$(".ballUser1, .ballUser2").css({
			"top" : "calc(100% - 60px)"
		})



		$(".finalGame .endGamePanel").css({
			"display" : "none"
		})

		$(".finalGame .endGamePanel .winPanel").css({
			"display" : "none"
		})

		$(".finalGame .endGamePanel .loosePanel").css({
			"display" : "none"
		})		



	})










/*
________________________________________________
	exp2
________________________________________________

*/



//launch exp2

	$( "body" ).on(clickOrTouch, ".linkToExp2", function() {

		socket.emit('linkToExp2Cliqued', myRoomNbr);

	})




	socket.on('launchExp2', function(){

		$(".finalGame").css({
			"display" : "none"
		})

		$('.experience2').css({
			"display" : "block"
		})

		$('.exp2Landing').css({
			"display" : "block"
		})


	})





	$( "body" ).on(clickOrTouch, ".exp2Landing .linkLaunchDrawExp", function() {

		socket.emit('linkLaunchDrawExpClicked', myRoomNbr);

	})



	// socket.on('launchDrawingExp', function(){

	// 	$('.exp2Landing').css({
	// 		"display" : "none"
	// 	});



	// })






/*

	drawingExperience

*/
	socket.on('launchDrawingExp', function(){

		$('.waitAnswerToPlay').css ({"display" : "none"})

		$('.exp2Landing').css({"display" : "none"})



        var COLOURS = [ '#768eff', '#ff8080'];
        var radius = 0;

        Sketch.create({



            container: document.getElementById( 'drawingExperienceWindow' ),
            autoclear: false,

            setup: function() {
                //console.log( 'setup' );
            },

            update: function() {
                radius = 2 + abs( sin( this.millis * 0.003 ) * 25 );

                if (radius) {
                }
            },

            // Event handlers

            keydown: function() {
                if ( this.keys.C ) this.clear();
            },

            // Mouse & touch events are merged, so handling touch events by default
            // and powering sketches using the touches array is recommended for easy
            // scalability. If you only need to handle the mouse / desktop browsers,
            // use the 0th touch element and you get wider device support for free.



            touchmove: function() {


                for ( var i = this.touches.length - 1, touch; i >= 0; i-- ) {


                    touch = this.touches[i];


                    touchmoveThis = this;




                    touchmoveThis.lineCap = 'round';
                    touchmoveThis.lineJoin = 'round';
                    touchmoveThis.fillStyle = this.strokeStyle = COLOURS[ i % COLOURS.length ];
                    touchmoveThis.lineWidth = radius;

                    touchmoveThis.beginPath();
                    touchmoveThis.moveTo( touch.ox, touch.oy );
                    touchmoveThis.lineTo( touch.x, touch.y );
                    touchmoveThis.stroke();



                    lol = touchmoveThis.lineCap;


                }


					socket.emit('pass', myRoomNbr);



            }
        });
        


	})
	// end launchDrawingExp






	socket.on('retour', function(touchmoveThis){


	})


















/*
________________________________________________
	exp3
________________________________________________

*/



//launch exp3

	$( "body" ).on(clickOrTouch, ".linkToExp3", function() {

		socket.emit('linkToExp3Cliqued', myRoomNbr);

	})




	socket.on('launchExp3', function(){

		$('.experience2').css({"display" : "none"})

		$('.tapGame1').css({"display" : "none"})
		$('.tapGame2').css({"display" : "none"})
		$('.tapGame3').css({"display" : "none"})
		$('.finalGame').css({"display" : "none"})

		$('.experience3').css({"display" : "block"})


	})






	$( "body" ).on(clickOrTouch, ".tempoLinkToMenu", function() {

		socket.emit('tempoLinkToMenuCliqued', myRoomNbr, me, myPartner);

	})



	socket.on('backToMenu', function(){

		$('.experience3').css({"display" : "none"})


	})


































/*

	Helpers button

*/





	$( "body" ).on(clickOrTouch, ".plumBox", function() {
		socket.emit('plumEvent');

	});
	
	socket.on('retourPlumEvent', function(roomNbr){
		//console.log("Plum button clicked");



	});



	$( "body" ).on(clickOrTouch, ".blueBox", function() {

		// socket.emit('linkToExp2Cliqued', myRoomNbr);

		socket.emit('blueEvent', myRoomNbr);
		console.log(myRoomNbr);
	});


	socket.on('retourBlueEvent', function(){
		console.log(myRoomNbr);

	});

































/*

	touchExperience

*/





	$(document).on("mousedown", ".tapZone, .launchPanel, .endGamePanel, body", function(event) {
		var positionX = event.pageX;
		var positionY = event.pageY;
		socket.emit('touchSurfaceCliqued', positionX, positionY, myRoomNbr)
    });





	$(document).on("mouseup", ".tapZone, .launchPanel, .endGamePanel, body", function() {
		socket.emit('touchSurfaceReleased', myRoomNbr)
    });




	socket.on('displayRound', function(positionX, positionY){

		if (playerNbr == user1) {
	        $( ".rond1" )
	        .css({
	        	"opacity": 1,
	        	"background": "url(img/touchSurface/touchGradientRed.png)",
	        	"background-position" : "center center",
	        	"background-size" : "100%",
	            "top" :  positionY - 60,
	            "left" :  positionX - 60
	         })
	        .fadeIn(00)
	        .queue(function() {
	            $( this )
	            .delay(100)
	            //.fadeOut(200).dequeue();
	        })
		} else if (playerNbr == user2) {
	        $( ".rond2" )
	        .css({
	        	"opacity": 1,
	        	"background": "url(img/touchSurface/touchGradientRed.png)",
	        	"background-position" : "center center",
	        	"background-size" : "100%",
	            "top" :  positionY - 60,
	            "left" :  positionX - 60
	         })
	        .fadeIn(00)
	        .queue(function() {
	            $( this )
	            .delay(100)
	            //.fadeOut(200).dequeue();
	        })			
		}

	})


	socket.on('releaseRound', function(){
		if (playerNbr == user1) {
	        $( ".rond1" ).fadeOut(200).dequeue();
		} else if (playerNbr == user2) {
			$( ".rond2" ).fadeOut(200).dequeue();
		}
	})








/*

	Launch gaming push

*/



	$( "body" ).on(clickOrTouch, ".linkGamingPush", function(event) {

		socket.emit('linkGamingPushCliqued', myRoomNbr)
    });



	socket.on('launchGamingPush', function(myRoomNbr){
	
		$('.touchSurface').css({
			"left" : "-100%",
			"display" : "none"
		})
	        


		$('.gamingPush').css({
			"left" : 0,
			"display" : "block"
		})


		if (playerNbr == user1) {
			$('.pushButton2').css ({
				"display" : "none"
			})
		}
		if (playerNbr == user2) {
			$('.pushButton1').css ({
				"display" : "none"
			})
		}


	        
	})













/*

	Gaming push

*/






	$( ".gamingPush" ).on(clickOrTouch, ".pushButton1", function() {
		socket.emit('pushButton1');
	});


	socket.on('movingHorse1', function(positionHorse1){
		$( ".pushHorse1" ).css({
			"-webkit-transform" :  "translateY(" + positionHorse1 + "%)"
		})
	});



	$( ".gamingPush" ).on(clickOrTouch, ".pushButton2", function() {
		socket.emit('pushButton2');
	});


	socket.on('movingHorse2', function(positionHorse2){
		$( ".pushHorse2" ).css({
			"-webkit-transform" :  "translateY(" + positionHorse2 + "%)"
		})
	});







	// STOP THE GAME

	socket.on('stopGamingPush', function(winnerName){
		console.log(winnerName + " win!");

		$( ".endGamingMessage" ).css({
			"display" :  "block"
		})

	});


	$( "body" ).on(clickOrTouch, ".youWinAccept", function() {
		socket.emit('youWinAcceptCliqued', myRoomNbr)
    });




	socket.on('closeGamingPush', function(){
		$( ".gamingPush" ).css({
			"display" :  "none"
		})

	});


















// fin du truc pour attendre que jQuery soit bien chargé
})(jQuery);