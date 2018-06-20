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
var choices = ["rock", "paper", "scissors"];
var playerId = "";
var p1Name = "";
var p2Name = "";
var p1wins = 0;
var p1lose = 0;
var p2wins = 0;
var p2lose = 0;
var snapshot;
var p1Choice;
var p2Choice;


// Get data from Firebase
database.ref().on("value", function(snap){
    snapshot = snap;
    p1Choice = snap.val().player1.choice;
    p2Choice = snap.val().player2.choice;

    if (snap.val().player1.choice && snap.val().player2.choice) {
        compare();
        
    }

}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// Players log in
function ready(){
    // console.log(snapshot.val());
    // console.log(snapshot.numChildren());

    // Empty field
    if ($("#input-name").val() === "") {
        $("#message").text("Please enter your name");
    
    }
    // Player 1 name has not been entered yet
    else if ((!snapshot.child("player1").exists()) || snapshot.val() === null) {
        p1Name = $("#input-name").val();
        playerId = 1;
        // console.log(playerId);
        $("#message").text("Hi, " + p1Name + "! You are Player 1. Please wait for Player 2");
        $("#player-name").text(p1Name);
        $("#player-id").text("Player " + playerId);
        $("#input-name").toggleClass("opacity");
        $("#button-name").toggleClass("opacity");
        database.ref("/player1").set({
            name: p1Name
        });
        
        database.ref(".info/connected").on("value", function(snap) {
            if (snap.val()) {
                console.log("P1: "+snap.val());
                database.ref("/player1").push(true);
                database.ref("player1").onDisconnect().remove();
            }
        });
        
    }
    // There are already two players logged in
    else if (snapshot.numChildren() === 2) {
        alert("Hi " + $("#input-name").val() + ", this session is full. Please try again later.");

    }
    // Player 1 name has been entered
    else if (snapshot.child("player1").exists()) {
        p2Name = $("#input-name").val();
        playerId = 2;
        $("#player-name").text(p2Name);
        $("#player-id").text("Player " + playerId);
        // console.log(playerId);
        $("#message").text("Hi, " + p2Name + "! You are Player 2");
        $("#input-name").toggleClass("opacity");
        $("#button-name").toggleClass("opacity");
        
        setTimeout(function() {
            database.ref("/player2").update({
                name: p2Name
            });
        }, 2000);
        database.ref(".info/connected").on("value", function(snap) {
            if (snap.val()) {
                console.log("P2: "+snap.val());
                database.ref("/player2").push(true);
                database.ref("player2").onDisconnect().remove();
            }
        });
    }
};

// After player 2 logs in, game starts after 5 seconds
database.ref("/player2/name").on("value", function(){
    if (playerId === 2) {
        $("#message").text("Wait for Player 1");
    };

    if (playerId === 1) {
        pTurn();
    };
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// Generate buttons for the player
function pTurn(){
    $("#message").text("Make your selection:")
    for (let i = 0; i < choices.length; i++) {
        var buttonChoice = $("<img style='width: 75px; margin: 1rem;'>");
        buttonChoice.addClass("choice");
        buttonChoice.attr("id", "button-" + choices[i]);
        buttonChoice.attr("data-value", choices[i]);
        buttonChoice.attr("src", "assets/images/choice-" + choices[i] + ".png");
        $("#choice-buttons").append($(buttonChoice));
    }
};

// After player 1 makes a choice, generate buttons for player 2
database.ref("/player1/choice").on("value", function(){
    if (playerId === 2) {
        pTurn();
    };
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// Compare the choices and determine who won
function compare() {

    if (p1Choice === p2Choice) {
        $("#message").text("It's a draw! You both chose " + p1Choice);
        setTimeout(function(){
            restartGame();
        }, 5000);

    } else if ((p1Choice === "scissors" && p2Choice === "paper") ||
               (p1Choice === "rock" && p2Choice === "scissors") ||
               (p1Choice === "paper" && p2Choice === "rock")) {
        if (playerId === 1) {
            $("#message").text("You win!");
            p1wins++;
            database.ref("/player1").update({
                won: p1wins
            })
        } else if (playerId === 2) {
            $("#message").text("You lose");
            p2lose++;
            database.ref("/player2").update({
                loss: p2lose
            })
        }
    } else if ((p1Choice === "paper" && p2Choice === "scissors") ||
               (p1Choice === "scissors" && p2Choice === "rock") ||
               (p1Choice === "rock" && p2Choice === "paper")) {
        if (playerId === 1) {
            $("#message").text("You lose");
            p1lose++;
            database.ref("/player1").update({
                loss: p1lose
            })
        } else if (playerId === 2) {
            $("#message").text("You win!");
            p2wins++;
            database.ref("/player2").update({
                won: p2wins
            })
        }
    };

    // database.ref("player1/choice").remove();
    // database.ref("player2/choice").remove();
};


// Restart the game
function restartGame() {
    $("#choice-buttons").empty();
    $("#choice").empty();
    database.ref("player1/choice").remove();
    database.ref("player2/choice").remove();
    
    if (playerId === 2) {
        $("#message").text("Wait for Player 1");
    };

    if (playerId === 1) {
        pTurn();
    };
};

// EVENT LISTENERS

// If user presses the ENTER key when entering name, run the "ready" function
$(document).on("keyup", "#input-name", function(event){
    if (event.keyCode === 13) {
        ready();
    }
});

// Buttons to choose rock, paper or scissors
$(document).on("click", ".choice", function(){
    var choice = ($(this).attr("data-value"));
    var choiceUpper = ($(this).attr("data-value")).toUpperCase();
    $("#message").text("Loading...")
    $("#choice").text("You chose " + choiceUpper);
    $("#button-" + choice).attr("src", "assets/images/choice-" + choice + "2.png")
    $(".choice").toggleClass("choice");

    database.ref("/player" + playerId).update({
        choice: choice
    });
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