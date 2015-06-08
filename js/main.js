

var positionX;
var positionY;





$(document).on("touchstart", ".tapZone, .launchPanel, .endGamePanel", function(event) {
    positionX = event.originalEvent.touches[0].pageX;
    positionY = event.originalEvent.touches[0].pageY;
    displayRound("touchstart", positionX, positionY);
})


$(document).on("touchend", ".tapZone, .launchPanel, .endGamePanel", function(event) {
	maskRound();
})






function displayRound(sortOfTouch, positionX, positionY) {

    $( ".rond3" )
    .css({
    	"opacity": 1,
    	"background": "url(img/touchSurface/touchGradientBlue.png)",
    	"background-position" : "center center",
    	"background-size" : "100%",
        "top" :  positionY - 75,
        "left" :  positionX - 75
     })
    .fadeIn(00)
    .queue(function() {
        $( this )
        .delay(100)
        //.fadeOut(200).dequeue();
    })

	    
}


function maskRound(){
	$('.rond3').fadeOut(200).dequeue();
}




/*

    drawingExperience

*/





















/*

    Empecher le scroll



http://stackoverflow.com/questions/8150191/disable-elastic-scrolling-in-safari


*/



$(document).bind('touchmove', function(event) {
    event.preventDefault();
});


