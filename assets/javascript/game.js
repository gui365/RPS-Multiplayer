// Empty the input for name when page loads
$("#input-name").val("");

// Initialize Firebase
var config = {
apiKey: "AIzaSyCVI4umFAvOh7CwaQ3nl9QRfqRafSdVnuE",
authDomain: "rps-multiplayer-e7f12.firebaseapp.com",
databaseURL: "https://rps-multiplayer-e7f12.firebaseio.com",
projectId: "rps-multiplayer-e7f12",
storageBucket: "rps-multiplayer-e7f12.appspot.com",
messagingSenderId: "819343542387"
};

firebase.initializeApp(config);

var database = firebase.database();


// Global variables
var turn = 1;
var playerId = "";
var p1name = "";
var p2name = "";
var snapshot;


// Get data from Firebase
database.ref().on("value", function(snap){
    snapshot = snap.val();
    // console.log(snapshot);
    
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});


// Players log in
function ready(){
    // console.log(snapshot.val());
    

    // Empty field
    if ($("#input-name").val() === "") {
        $("#message").text("Please enter your name");
    
    // Player 1 name has not been entered yet
    } else if (snapshot === null) {
        p1Name = $("#input-name").val();
        playerId = 1;
        // console.log(playerId);
        $("#message").text("Hi, " + p1Name + "! You are Player 1. Please wait for Player 2");
        $("#input-name").toggleClass("opacity");
        $("#button-name").toggleClass("opacity");

        database.ref("/player1").set({
            wins: 0,
            losses: 0,
            name: p1Name
        });
        
    // Player 1 name has been entered
    } else if (snapshot !== null) {
        p2Name = $("#input-name").val();
        playerId = 2;
        // console.log(playerId);
        $("#message").text("Hi, " + p2Name + "! You are Player 2");
        $("#input-name").toggleClass("opacity");
        $("#button-name").toggleClass("opacity");
        
        setTimeout(function() {
            database.ref("/player2").set({
                wins: 0,
                losses: 0,
                name: p2Name
            });
        }, 3000);
        
    }
};


// After player 2 logs in, game starts after 5 seconds
database.ref("/player2/name").on("value", function(){
    if (playerId === 2) {
        $("#message").text("Wait for Player 1");
    };

    if (playerId === 1) {
        setTimeout(p1Turn, 5000);
    };
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});


function p1Turn(){
    $(".choice").toggleClass("opacity")
    $("#message").text("Make your selection:")
}






// function choice() {
//     database.ref("/player2").update({
//         choice: "and that"
//     });
// }


// EVENT LISTENERS

// If user presses the ENTER key when entering name, run the "ready" function
$(document).on("keyup", "#input-name", function(event){
    if (event.keyCode === 13) {
        ready();
    }
});

// Buttons to choose rock, paper or scissors
$(document).on("click", ".choice", function(){
    var choice = $(this).attr("data-value");
    $("#choice").text(choice);
    database.ref("/player1").update({
        choice: choice
    })
});




//  1 Player logs their name on the input field and hit the "ready" button.
//  2 If that's the first player logging in, he's name is Player 1's name. Otherwise he's player 2
//  3 When 2 players are logged in, the game starts. It's P1 turn first. He makes a choice then waits for P2 to choose
//  4 (if name is = p1 show only p1 choice, and vice versa)

// function test(){
//     snapshot.player2.wins ++;
//     console.log(snapshot.player2.wins);
//     database.ref("player2").update({
//         wins: snapshot.player2.wins
//     }); 
// }