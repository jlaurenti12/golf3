  var firebaseConfig = {
    apiKey: "AIzaSyBlpwV4ee1ndE9teFrZU5SJAtD6R0iuG4M",
    authDomain: "cribbage-be501.firebaseapp.com",
    databaseURL: "https://cribbage-be501-default-rtdb.firebaseio.com",
    projectId: "cribbage-be501",
    storageBucket: "cribbage-be501.appspot.com",
    messagingSenderId: "317022580762",
    appId: "1:317022580762:web:0a90a326ddc79e235ae1a3"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

//=======================================
//Firebase setup
//=======================================

// get the game's unique key from the EJS variable
let gameKey = document.querySelector('#data').dataset.gamekey;

// create a firebase node with the game's unique key
let gameListRef = firebase.database().ref(`gameList_${gameKey}`);
gameListRef.push();

let DeckReference = firebase.database().ref(`gameKey_${gameKey}`);
let deckRef = DeckReference.child('deckoCards');
let turnRef = DeckReference.child('turns');
let lastTurnRef = DeckReference.child('lastTurns')
let passRef = DeckReference.child('passVisible');
let resetCountRef = DeckReference.child('resetCount');
let holesRef = DeckReference.child('holes');
let visibleCardsRef = DeckReference.child('visibleCards');


let Player1Ref = DeckReference.child('player1');
let player1HandRef = Player1Ref.child('player1Hand');
let player1ScoreRef = Player1Ref.child('player1score');

let Player2Ref = DeckReference.child('player2');
let player2HandRef = Player2Ref.child('player2Hand');
let player2ScoreRef = Player2Ref.child('player2score');

let Player3Ref = DeckReference.child('player3');
let player3HandRef = Player3Ref.child('player3Hand');
let player3ScoreRef = Player3Ref.child('player3score');

let Player4Ref = DeckReference.child('player4');
let player4HandRef = Player4Ref.child('player4Hand');
let player4ScoreRef = Player4Ref.child('player4score');

let instructionRef = DeckReference.child('instructions');
let starterRef = DeckReference.child('starter');
let discardedCardsRef = DeckReference.child('discardedCards');

let dealRef = DeckReference.child('deal');
// let coinFlipRef = DeckReference.child('coinFlip');
let resetRef = DeckReference.child('reset');

//set the player hands to empty on page load
player1HandRef.set({player1Cards:[]});
player1ScoreRef.set([]);

player2HandRef.set({player2Cards:[]});
player2ScoreRef.set([]);

player3HandRef.set({player3Cards:[]});
player3ScoreRef.set([]);

player4HandRef.set({player4Cards:[]});
player4ScoreRef.set([]);

resetCountRef.set(0);
holesRef.set(0);
visibleCardsRef.set(0);

discardedCardsRef.set({discardedCards:[]});
turnRef.set('');
passRef.set(false);
lastTurnRef.set(false);
instructionRef.set('pre-deal');

dealRef.set(false);
resetRef.set(false);

// coinFlipRef.set({ player1: '', player2: '', player3: '', player4: ''});

// remove the game's firebase node when the players leave the page
window.addEventListener('beforeunload', (event) => {
  DeckReference.set({});
})

//========================================
//create card class and deck
//========================================
class Card {
  constructor(suit, value, rank){
    this.suit = suit;
    this.value = value;
    this.rank = rank;
    this.hidden = true;
    this.selected = false;
  }
}

//create deck out of Card class
class Deck {
  constructor() {
    this.deck = [];
    deckRef.set(this.deck)
  }

  createDeck(suits, values, ranks) {
    for (let i = 0; i < suits.length; i++) {
        for (let j = 0; j < values.length; j++) {
            this.deck.push(new Card(suits[i], values[j], ranks[j], true, false));
        }
    }

    this.deck.push(new Card("Joker", "joker1", -3, true, false));
    this.deck.push(new Card("Joker", "joker2", -3, true, false));

    deckRef.set(this.deck);
    return this.deck;
  }

  shuffle() {
    let counter = this.deck.length, temp, i;

    while(counter) {
      i = Math.floor(Math.random() * counter--);
      temp = this.deck[counter];
      this.deck[counter] = this.deck[i];
      this.deck[i] = temp;
    }
    deckRef.set(this.deck);
    return this.deck;
  }

}


function shuffle(deck) {
  let counter = deck.length, temp, i;

  while(counter) {
    i = Math.floor(Math.random() * counter--);
    temp = deck[counter];
    deck[counter] = deck[i];
    deck[i] = temp;
  }
  deckRef.set(deck);
  return deck;
}

//hold the suits and values
let suits = ['Hearts', 'Diamonds', 'Spades', 'Clubs'];
let values = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
let ranks = [-1, -2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 0];

//create new deck and shuffle it
let cardDeck = new Deck();
cardDeck.createDeck(suits, values, ranks);
cardDeck.shuffle();

//get player hands html elements
let player1El = document.querySelector('.player1');
let player2El = document.querySelector('.player2');
let player3El = document.querySelector('.player3');
let player4El = document.querySelector('.player4');

let $player1El = $('.player1');
let $player2El = $('.player2');
let $player3El = $('.player3');
let $player4El = $('.player4');

// Curtain elements
let $hand1Curtain = $('.hand1-curtain');
let $hand2Curtain = $('.hand2-curtain');

//get player crib elements
let player1CribEl = document.querySelector('.crib1');
let player2CribEl = document.querySelector('.crib2');

let $player1Crib = $('.crib1');
let $player2Crib = $('.crib2');

let starterEl = document.querySelector('#showingCard');
let remainingCard = document.querySelector('#remainingCards');
let instructions = document.querySelector('.instructions');
let player1PotEl = document.querySelector('.player1-pot');
let player2PotEl = document.querySelector('.player2-pot');

// Score Elements
let player1ScoreEl = document.querySelector('#player1Score');
let player2ScoreEl = document.querySelector('#player2Score');
let player3ScoreEl = document.querySelector('#player3Score');
let player4ScoreEl = document.querySelector('#player4Score');

//get button elements
let dealButton = document.querySelector('#dealEl');
// let resetButton = document.querySelector('#resetEl');
let scoresButton = document.querySelector('#scoresEl');



// get count element
let countEl = document.querySelector('.count');

// determine if player 1,2,3,4
// coinFlipRef.once('value', (snap) => {
//   let val = snap.val();
//   console.log(val);
//   if(val.player1 === '') {
//     val = {player1: "Player 1", player2: "", player3: "", player4: ""};
//     console.log(val);
//     coinFlipRef.set(val);
//     playerModal(val.player1);
//   } else if (val.player1 === '') {
//     val.player2 = 'Player 2';
//     console.log(val);
//     coinFlipRef.set(val);
//     playerModal(val.player2);
//   } else if (val.player2 === "Player 2") {
//     val.player3 = 'Player 3';
//     console.log(val);
//     coinFlipRef.set(val);
//     playerModal(val.player3);
//   } else if (val.player3 === "Player 3") {
//     val.player4 = 'Player 4';
//     console.log(val);
//     coinFlipRef.set(val);
//     playerModal(val.player4);
//   }
// })

// function playerModal(playerNum) {
//   let modal = document.createElement('div');
//   modal.classList.add('modal');
//   modal.innerHTML = `
//   <div class="modal-content">
//     <h3>You are ${playerNum}!</h3>
//     <p class="modal-description">Welcome to online cribbage! Here's some important info before you get started.</p>
//     <ul>
//     <li>The game will reset if you or the other player reloads or refreshes the page.</li>
//     <li>As ${playerNum}, you will not see the other player's cards until they are played.</li>
//     <li>The link to this game will be valid for 24 hours after it was created.</li>
//     <li>The first two cards you click in your hand will go to the crib, the rest will go to the play.</li>
//     <li>If you need to look up the rules, <a href="https://bicyclecards.com/how-to-play/cribbage/" target="_blank" rel="noopener">click here</a>.</li>
//     <p>That's it, have fun!</p>
//     <span class="modal-close" onclick="closeModal()">x</span>
//   </div>
//   `;
//   document.querySelector('#controls-wrapper').appendChild(modal);
// }

scoresButton.addEventListener('click', showModal);


function showModal() {
  let modal = document.createElement('div');
  modal.classList.add('modal');

  let p1 = [];
  let p2 = [];
  let p3 = [];
  let p4 = [];


  let roundScores = [];

  // get scores array for each player

  player1ScoreRef.on('value', (snap)=>{
    let scores = snap.val();
    for (score in scores) {
      p1.push(scores[score]);
    }
  });
  
  player2ScoreRef.on('value', (snap)=>{
    let scores = snap.val();
    for (score in scores) {
      p2.push(scores[score]);
    }
  });

  player3ScoreRef.on('value', (snap)=>{
    let scores = snap.val();
    for (score in scores) {
      p3.push(scores[score]);
    }
  });

  player4ScoreRef.on('value', (snap)=>{
    let scores = snap.val();
    for (score in scores) {
      p4.push(scores[score]);
    }
  });


  for (i = 0; i < p1.length; i++) {
    let arr = [];
    arr.push(p1[i], p2[i], p3[i], p4[i]);
    roundScores.push(arr);
    arr = [];
  }


  modal.innerHTML = `
  <div class="modal-content">
    <h3>Scores By Round</h3>
    <span class="modal-close" onclick="closeModal()">x</span>
    <table id="scores">
      <tr>
        <th>Holes</th>
        <th>Player 1</th>
        <th>Player 2</th>
        <th>Player 3</th>
        <th>Player 4</th>
      </tr>
    </table>
  </div>
  `;

  document.querySelector('#controls-wrapper').appendChild(modal);


  var rows = "";

    roundScores.forEach(function(roundScore) {
      rows += "<tr><td>" + (roundScores.indexOf(roundScore) + 1) + "</td><td>" + roundScore[0] + "</td><td>" + roundScore[1] + "</td><td>" + roundScore[2] + "</td><td>" + roundScore[3] + "</td></tr>";
    });

    $( rows ).appendTo( "#scores" );
      

}


function closeModal() {
  $('.modal').remove();
}


//============================================
//call deal function when click on deal button
//============================================
dealButton.addEventListener('click', deal);


function snapshotToArray(snapshot) {
    var returnArr = [];

    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        // item.key = childSnapshot.key;

        returnArr.push(item);
    });

    return returnArr;
};

function deal(){


  starterRef.set([]);

  player1HandRef.set({player1Cards:[]});
  player2HandRef.set({player2Cards:[]});
  player3HandRef.set({player3Cards:[]});
  player4HandRef.set({player4Cards:[]});


  instructionRef.once('value', (snap)=>{
    let state = snap.val();

      if (state === "post-round") {
        resetCountRef.once('value', (snap)=>{
          let count = snap.val();

          if (count < 3) {
            count++;
          } else {
            count = 0;
          }

          resetCountRef.set(count);

        });
        cardDeck = new Deck();
        cardDeck.createDeck(suits, values, ranks);
        cardDeck.shuffle();
        turnRef.set('');
        passRef.set(false);
        lastTurnRef.set(false);
        discardedCardsRef.set({discardedCards:[]});
      }

  });


  instructionRef.set('post-deal');

  holesRef.once('value', (snap)=>{
    let hole = snap.val();
    hole++

    holesRef.set(hole);
  });


  dealRef.once('value', (snap)=>{
    deal = snap.val();

    if (document.getElementById("new")){
      player1HandRef.set({player1Cards:[]});
      player2HandRef.set({player2Cards:[]});
      player3HandRef.set({player3Cards:[]});
      player4HandRef.set({player4Cards:[]});
      holesRef.set(1);
      dealRef.set(false);
      instructionRef.set('post-deal');
      resetCountRef.set(0);
      player1ScoreRef.set(0);
      player2ScoreRef.set(0);
      player3ScoreRef.set(0);
      player4ScoreRef.set(0);
      cardDeck = new Deck();
      cardDeck.createDeck(suits, values, ranks);
      cardDeck.shuffle();
      passRef.set(false);
      lastTurnRef.set(false);
      discardedCardsRef.set({discardedCards:[]});
    }
  
    if (deal) {}
    else {
      dealRef.set(true);


      deckRef.once('value', (snap)=>{
        let fbDeck = snap.val();
        let turn = 0;

        for (i = 0; i < 24; i++) {

          let fbCard = fbDeck.shift();

          if (turn === 0) {
            player1HandRef.push(fbCard);
            turn++
          } else if (turn === 1) {
            player2HandRef.push(fbCard);
            turn++
          } else if (turn === 2) {
            player3HandRef.push(fbCard);
            turn++
          } else {
            player4HandRef.push(fbCard);
            turn = 0
          }
        }

          let starter = fbDeck[0];
          // console.log(starter);

          starter.hidden = true;
          starterRef.push(starter);
          starterRef.once('value', function(snapshot) {
              let hand = snapshotToArray(snapshot);
              // console.log(hand);
              
              starterRef.set(hand);
          });

        fbDeck.shift();
        deckRef.set(fbDeck);
        instructionRef.set('post-deal');
      });

      }

    });

};

//listen for change in value of player 1 hand
//then creates an html element with that suit and value
player1HandRef.on('value', (snap)=>{
  let hand = snap.val();
  //reset the players hand element
  player1El.innerHTML='';
  getFBHand(player1El, hand);
});


player1ScoreRef.on('value', (snap)=>{
  let score = snap.val();
  
  //calculate the total score
  let totalScore = 0;
  scores = snap.val();
  for (score in scores) {
    totalScore += scores[score];
  }

  //reset the players hand element
  player1ScoreEl.innerHTML='';
  getScore(player1ScoreEl, totalScore);
});

//listen for change in value of player 2 hand
//then creates an html element with that suit and value
player2HandRef.on('value', (snap)=>{
  let hand = snap.val();
  //reset player hand element
  player2El.innerHTML='';
  getFBHand(player2El, hand);
})


player2ScoreRef.on('value', (snap)=>{
  let score = snap.val();
  
  //calculate the total score
  let totalScore = 0;
  scores = snap.val();
  for (score in scores) {
    totalScore += scores[score];
  }

  //reset the players hand element
  player2ScoreEl.innerHTML='';
  getScore(player2ScoreEl, totalScore);
});


player3HandRef.on('value', (snap)=>{
  let hand = snap.val();
  //reset player hand element
  player3El.innerHTML='';
  getFBHand(player3El, hand);
})

player3ScoreRef.on('value', (snap)=>{
  let score = snap.val();
  
  //calculate the total score
  let totalScore = 0;
  scores = snap.val();
  for (score in scores) {
    totalScore += scores[score];
  }

  //reset the players hand element
  player3ScoreEl.innerHTML='';
  getScore(player3ScoreEl, totalScore);
});


player4HandRef.on('value', (snap)=>{
  let hand = snap.val();
  //reset player hand element
  player4El.innerHTML='';
  getFBHand(player4El, hand);
})

player4ScoreRef.on('value', (snap)=>{
  let score = snap.val();
  
  //calculate the total score
  let totalScore = 0;
  scores = snap.val();
  for (score in scores) {
    totalScore += scores[score];
  }

  //reset the players hand element
  player4ScoreEl.innerHTML='';
  getScore(player4ScoreEl, totalScore);
});

instructionRef.on('value', (snap)=>{
  let state = snap.val();
  instructions.innerHTML = '';
  getInstructions(state);
})

starterRef.on('value', (snap)=>{
  let hand = snap.val();
  starterEl.innerHTML = '';
  getStarter(starterEl, hand);
})

passRef.on('value', (snap)=>{
  let passVis = snap.val();
  showHide(passVis);
})

turnRef.on('value', (snap)=>{
  let player = snap.val();
  checkTurn(player);
})

holesRef.on('value', (snap)=>{
  let hole = snap.val();
  getHoleCount(hole);
})

dealRef.on('value', (snap)=>{
  let deal = snap.val();
  let hole;
  
  holesRef.once('value', (snap)=>{
    hole = snap.val();
  })

  getDeal(deal, hole);
})



//this runs every time there is a change in a player's hand in the database
//for each key in hand, create HTML element and append to hand element
function getFBHand(handEl, hand){

  let count = 0;

  for(key in hand){

    let suit = hand[key].suit;
    let value = hand[key].value;
    let hidden = hand[key].hidden;
    let cardEl = document.createElement('li');
    cardEl.classList.add(suit);
    cardEl.classList.add(value);
    cardEl.classList.add('card');
    if (hidden) {
      cardEl.classList.add('hide');
    } else if (suit === "Joker") {
      cardEl.innerHTML ='';
    } else {
      cardEl.innerHTML =
      `<span class="${value} value">${value}</span>`;
    }

    if (hidden) {
      count++
    }

    handEl.appendChild(cardEl);
  }


  if (count > 5) {
      slist(handEl, hand);
  }

}


function slist (target, hand) {


  target.classList.add("slist");
  var items = target.getElementsByTagName("li"), current = null;

  for (let i of items) {
    // (B1) ATTACH DRAGGABLE
    i.draggable = true;
    
    // (B2) DRAG START - YELLOW HIGHLIGHT DROPZONES
    i.addEventListener("dragstart", function (ev) {
      current = this;
      for (let it of items) {
        if (it != current) { it.classList.add("hint"); }
      }
    });
    
    // (B3) DRAG ENTER - RED HIGHLIGHT DROPZONE
    i.addEventListener("dragenter", function (ev) {
      if (this != current) { this.classList.add("active"); }
    });

    // (B4) DRAG LEAVE - REMOVE RED HIGHLIGHT
    i.addEventListener("dragleave", function () {
      this.classList.remove("active");
    });

    // (B5) DRAG END - REMOVE ALL HIGHLIGHTS
    i.addEventListener("dragend", function () {
      for (let it of items) {
        it.classList.remove("hint");
        it.classList.remove("active");
      }
    });
    
    // (B6) DRAG OVER - PREVENT THE DEFAULT "DROP", SO WE CAN DO OUR OWN
    i.addEventListener("dragover", function (evt) {
      evt.preventDefault();
    });
    
    // (B7) ON DROP - DO SOMETHING
    i.addEventListener("drop", function (evt) {

      let cardA;
      let cardB;

      for(key in hand){

        console.log(hand[key].value)
        console.log(hand[key].suit)

        if((hand[key].value == this.classList[1]) && (hand[key].suit === this.classList[0])) {
          console.log('matchA');
          cardA = hand[key];
          console.log(cardA);
        }
      }

      for(key in hand){

        console.log(hand[key].value)
        console.log(hand[key].suit)



        if((hand[key].value == current.classList[1]) && (hand[key].suit === current.classList[0])) {
          console.log('matchB');
          cardB = hand[key];
          console.log(cardB);
        }

      }

      for (key in hand) {
        if ((hand[key].value === cardA.value) && (hand[key].suit === cardA.suit)){
          hand[key] = cardB; 
        } else if ((hand[key].value === cardB.value) && (hand[key].suit === cardB.suit)){
          hand[key] = cardA;
        }
      }

      target.innerHTML='';
      getFBHand(target, hand);

      if (target.classList[0] === Player1Ref.key) {
        player1HandRef.set(hand);
      } else if (target.classList[0] === Player2Ref.key) {
        player2HandRef.set(hand);
      } else if (target.classList[0] === Player3Ref.key) {
        player3HandRef.set(hand);
      } else if (target.classList[0] === Player4Ref.key) {
        player4HandRef.set(hand);
      }

    });
  }
};

function checkTurn(player) {
  if (player === Player1Ref.key) {
    player1El.classList.add('selected');
    player2El.classList.remove('selected');
    player3El.classList.remove('selected');
    player4El.classList.remove('selected');
  } else if (player === Player2Ref.key) {
    player2El.classList.add('selected');
    player1El.classList.remove('selected');
    player3El.classList.remove('selected');
    player4El.classList.remove('selected');
  } else if (player === Player3Ref.key) {
    player3El.classList.add('selected');
    player4El.classList.remove('selected');
    player1El.classList.remove('selected');
    player2El.classList.remove('selected');
  } else if (player === Player4Ref.key) {
    player4El.classList.add('selected');
    player1El.classList.remove('selected');
    player2El.classList.remove('selected');
    player3El.classList.remove('selected');
  } else {
    player1El.classList.remove('selected');
    player2El.classList.remove('selected');
    player3El.classList.remove('selected');
    player4El.classList.remove('selected');
  }
}


function getScore(player, score)  {
    player.innerHTML = score;
}


function getDeal(deal, hole) {

  visibleCardsRef.set(checkRoundFinish());
  let visibleCards;

  visibleCardsRef.on('value', (snap)=>{
    visibleCards = snap.val();
  });

  if (deal === false && hole === 9) {
    dealButton.style.display = "inline-block";
    dealButton.style.zIndex = "100";
    dealButton.innerHTML = "New Game";
    dealButton.id = "new";
    starterEl.style.display = "none";
    remainingCard.style.display = "none";
  } else if (visibleCards === 24) {
    dealButton.style.display = "inline-block";
    dealButton.style.zIndex = "100";
    dealButton.innerHTML = "Next Hole";
    dealButton.id = "next";
    starterEl.style.display = "none";
    remainingCard.style.display = "none";
  } else if (deal) {
    dealButton.style.display = "none";
  } else if (deal === false && hole === 0){
    dealButton.innerHTML = "Deal";
    dealButton.id = "deal";
  } else {
    dealButton.style.display = "inline-block";
    remainingCard.style.display = "none";
  }
}


function getHoleCount(hole) {
  $('#holeCount').html(hole);
}


function showHide(passVis) {

  remainingCard.style.display = "block";

  if (passVis) {
    remainingCard.innerHTML = `<div id="pass"><button id="pass">Pass</button></div>`;
  } else {
    remainingCard.innerHTML = `<div id="deck" class="hide card"></div>`;
  }
}

function getInstructions(state) {
  if (state === 'pre-deal') {
    instructions.style.visibility = 'visible';
    instructions.innerHTML = `<span>Click Deal to start!</span>`;
  } else if (state === 'post-deal') {
    instructions.style.visibility = 'visible';
    instructions.innerHTML = `<span>Move your cards around and then flip 2 over!</span>`;
  } else if (state === 'post-round') {
    instructions.style.visibility = 'visible';
    instructions.innerHTML = `<span>Click next hole to continue!</span>`;
  } else if (state === 'game-over') {
    instructions.style.visibility = 'visible';
    instructions.innerHTML = `<span>Game Over!</span>`;
  } else {
    instructions.style.visibility = 'hidden';
  }
}

function getStarter(handEl, hand) {

    let passVis;

    passRef.on('value', (snap)=>{
      passVis = snap.val();
    })

    showHide(passVis);

    starterEl.style.display = "block";

    for(key in hand){
      let suit = hand[key].suit;
      let value = hand[key].value;
      let hidden = hand[key].hidden;
      let cardEl = document.createElement('div');
      let selected = hand[key].selected;
      if (selected) {
        cardEl.classList.add('selected');
      } else {
        cardEl.classList.remove('selected');
      }

      if (hidden) {
        cardEl.style.visibility = "hidden";
      } else if (suit === "Joker") {
          cardEl.innerHTML ='';
      } else {
          cardEl.innerHTML =
        `<span class="${value} value">${value}</span>`;
      }    
      cardEl.classList.add(suit);
      cardEl.classList.add(value);
      cardEl.classList.add('card');
      handEl.appendChild(cardEl);
    }

}


function checkForStart() {
  let count = 0;

  player1HandRef.once('value', (snap)=>{
    let p1 = snap.val();

    for (key in p1) {
      let fbHidden = p1[key]['hidden'];
      if (fbHidden == false) {
        count++
      }
    }
   });


    player2HandRef.once('value', (snap)=>{
    let p2 = snap.val();

    for (key in p2) {
      let fbHidden = p2[key]['hidden'];
      if (fbHidden == false) {
        count++
      }
    }
   });

    player3HandRef.once('value', (snap)=>{
    let p3 = snap.val();

    for (key in p3) {
      let fbHidden = p3[key]['hidden'];
      if (fbHidden == false) {
        count++
      }
    }
   });

    player4HandRef.once('value', (snap)=>{
    let p4 = snap.val();

    for (key in p4) {
      let fbHidden = p4[key]['hidden'];
      if (fbHidden == false) {
        count++
      }
    }
   });

  return count;
}


function switchTurns(player) {

  var lastChar = player.substr(player.length - 1);
  lastChar = parseInt(lastChar);

  if (lastChar < 4) {
    lastChar++;
    lastChar = lastChar.toString();
    var string = "player" + lastChar; 
  } else {
    lastChar = 1;
    lastChar = lastChar.toString();
    var string = "player" + lastChar; 
  }


  turnRef.set(string)
}

function checkAllVisible(hand, player, pScore) {

  let count = 0;

  for (key in hand) {
    // check how many cards in the hand are hidden
    let fbHidden = hand[key]['hidden'];

    if (fbHidden == false) {
      count++
    }

  }

  if (count === 6) {
    findScore(hand, player, pScore);
    lastTurnRef.set(true);
  }

  checkRoundFinish();

};


function checkRoundFinish(){
  let count = 0;

  player1HandRef.once('value', (snap)=>{
    let p1 = snap.val();

    for (key in p1) {
      let fbHidden = p1[key]['hidden'];
      if (fbHidden == false) {
        count++
      }
    }
   });


    player2HandRef.once('value', (snap)=>{
    let p2 = snap.val();

    for (key in p2) {
      let fbHidden = p2[key]['hidden'];
      if (fbHidden == false) {
        count++
      }
    }
   });

    player3HandRef.once('value', (snap)=>{
    let p3 = snap.val();

    for (key in p3) {
      let fbHidden = p3[key]['hidden'];
      if (fbHidden == false) {
        count++
      }
    }
   });

    player4HandRef.once('value', (snap)=>{
    let p4 = snap.val();

    for (key in p4) {
      let fbHidden = p4[key]['hidden'];
      if (fbHidden == false) {
        count++
      }
    }
   });

  // checkGameFinish();

  holesRef.once('value', (snap)=>{
    let hole = snap.val();

     if (count === 24 && hole === 9) {
      instructionRef.set('game-over');
      dealRef.set(false);
      // getDeal(false, hole);
     }
     else if (count === 24) {
      instructionRef.set('post-round');
      dealRef.set(false)
      // getDeal(false, hole);

    }

  });


  return count;

}


function findScore(hand, player, pScore) {

    var ranks = [];
    var values = [];

    for (key in hand) {
      let fbRank = hand[key].rank; 
      ranks.push(fbRank);
      let fbValue = hand[key].value;
      values.push(fbValue); 
    }

    var score = 0
    var column1 = 0;
    var column2 = 0;
    var column3 = 0;
    var row1 = 0;
    var row2 = 0;


    function rows(row, a, b, c, d, e, f) {
      if (a === b && b === c) {
        rowScore = 0;
      } else {
        rowScore = d + e + f;
      }
      return rowScore;
    };

    function columns (column, a, b, c , d) {
      var columnScore;

      if (a === b) {
        columnScore = 0;
      } else if ((a === 'joker1' || a === 'joker2') && (b === 'joker1' || b === 'joker2')) {
        columnScore = 0;
      } else {
        columnScore = c + d;
      }
      return columnScore
    };


     row1 = rows(row1, values[0], values[1], values[2], ranks[0], ranks[1], ranks[2]); 
     row2 = rows(row2, values[3], values[4], values[5], ranks[3], ranks[4], ranks[5]); 

     if (row1 === 0 || row2 === 0) {
      score = row1 + row2;
     } else {
      column1 = columns(column1, values[0], values[3], ranks[0], ranks[3]);
      column2 = columns(column2, values[1], values[4], ranks[1], ranks[4]);
      column3 = columns(column3, values[2], values[5], ranks[2], ranks[5]);
      score = column1 + column2 + column3;
     }

     pScore.push(score);

}



starterEl.addEventListener('click', (e)=>{

  let card = e.target.closest('div');

  if (checkForStart() >= 8){

      let hand;

      starterRef.once('value', (snap)=>{
        hand = snap.val();
      });

      for (key in hand) {
          let fbSelected = hand[key]['selected'];

          if (fbSelected) {
            hand[key]['selected'] = false;
          } else {
            hand[key]['selected'] = true;
          }

          starterEl.innerHTML='';

          getStarter(starterEl, hand);
                    
          starterRef.set(hand);
      }
      

  }

 });




remainingCard.addEventListener('click', (e)=>{


     if (checkForStart() >= 8){

      let card = e.target.closest('div');
      let count;

      deckRef.once('value', (snap)=>{
        let deck = snap.val();
        count = deck.length;

      starterRef.once('value', (snap)=>{
      let hand = snap.val();


          if (card === document.getElementById('deck')) {

            if (count === 1) {
               discardedCardsRef.once('value', (snap)=>{
               let discarded = snap.val();
               discardedCardsRef.set({discardedCards:[]});
               deckRef.set(shuffle(discarded));
              });
            }


              discardedCardsRef.push(hand[0]);
              discardedCardsRef.on('value', function(snapshot) {
                  let hand = snapshotToArray(snapshot);
                  discardedCardsRef.set(hand);
              });


              deckRef.once('value', (snap)=>{
                let fbDeck = snap.val();
                let starter = fbDeck[0];

                fbDeck.shift();
                deckRef.set(fbDeck);

                starterEl.innerHTML = '';
                starter.hidden = false;
                passRef.set(true);
                getStarter(starterEl, starter);
                // starterRef.set({starter:[]});
                starterRef.set([starter]);

            });

          } 
          else if (card === document.getElementById('pass')) {

              turnRef.once('value', (snap)=>{
                let turn = snap.val();
                switchTurns(turn);
 
                lastTurnRef.once('value', (snap)=> {
                let last = snap.val();

                if (last && turn === Player1Ref.key) {
                player1HandRef.once('value', (snap)=>{
                  let p1 = snap.val();
                  for (key in p1) {
                    p1[key]['hidden'] = false;
                  }
                  player1El.innerHTML='';
                  getFBHand(player1El, p1);
                  player1HandRef.set(p1);
                  checkAllVisible(p1, player1El.classList[0], player1ScoreRef);
                });
                }

                if (last && turn === Player2Ref.key) {
                player2HandRef.once('value', (snap)=>{
                  let p2 = snap.val();
                  for (key in p2) {
                    p2[key]['hidden'] = false;
                  }
                  player2El.innerHTML='';
                  getFBHand(player2El, p2);
                  player2HandRef.set(p2);
                  checkAllVisible(p2, player2El.classList[0], player2ScoreRef);
                });
                }

                if (last && turn === Player3Ref.key) {
                player3HandRef.once('value', (snap)=>{
                  let p3 = snap.val();
                  for (key in p3) {
                    p3[key]['hidden'] = false;
                  }
                  player3El.innerHTML='';
                  getFBHand(player3El, p3);
                  player3HandRef.set(p3);
                  checkAllVisible(p3, player3El.classList[0], player3ScoreRef);
                });
                }

                if (last && turn === Player4Ref.key) {
                player4HandRef.once('value', (snap)=>{
                  let p4 = snap.val();
                  for (key in p4) {
                    p4[key]['hidden'] = false;
                  }
                  player4El.innerHTML='';
                  getFBHand(player4El, p4);
                  player4HandRef.set(p4);
                  checkAllVisible(p4, player4El.classList[0], player4ScoreRef);
                });
              }

            });

          });
                let starter = hand;
                passRef.set(false);
              


          }
        });
      });


    } else {}
 
});

player1El.addEventListener('click', (e)=>{

  //get nearest card element to the target
  let card = e.target.closest('li.card');

  //get the suit and card value for the card that was clicked
  let suit = card.classList[0];
  let value = card.classList[1];

  selectCard(suit, value, player1HandRef, player1ScoreRef, player1El);

});

player2El.addEventListener('click', (e)=>{

  //get nearest card element to the target
  let card = e.target.closest('li.card');

  //get the suit and card value for the card that was clicked
  let suit = card.classList[0];
  let value = card.classList[1];

  selectCard(suit, value, player2HandRef, player2ScoreRef, player2El);

});

player3El.addEventListener('click', (e)=>{

  //get nearest card element to the target
  let card = e.target.closest('li.card');

  //get the suit and card value for the card that was clicked
  let suit = card.classList[0];
  let value = card.classList[1];

  selectCard(suit, value, player3HandRef, player3ScoreRef, player3El);

});

player4El.addEventListener('click', (e)=>{

  //get nearest card element to the target
  let card = e.target.closest('li.card');

  //get the suit and card value for the card that was clicked
  let suit = card.classList[0];
  let value = card.classList[1];

  selectCard(suit, value, player4HandRef, player4ScoreRef, player4El);

});


function selectCard(suit, value, playerHand, playerScore, playerEl) {

  //get a snapshot of the player's hand search it for the
  //corresponding card that was clicked
  //check if the rest of the players cards are hidden





  playerHand.once('value', (snap)=>{
    let hand = snap.val();
    let count = 0;

    starterRef.once('value', (snap)=> {
      let starter = snap.val();

        if (checkForStart() === 7 ){
          starter[0].hidden = false;
          getStarter(starterEl, starter);
          starterRef.set(starter);

          //check for reset count
          resetCountRef.once('value', (snap)=>{
            let count = snap.val();

            if (count === 0) {
              turnRef.set('player1');
            } else if (count === 1) {
               turnRef.set('player2');
            } else if (count === 2) {
               turnRef.set('player3');
            } else if (count === 3) {
               turnRef.set('player4');
            }
          });

         instructionRef.set('post-flip');
         
        }
      
        turnRef.once('value', (snap)=> {
        let turn = snap.val();

        if (starter !== null) {
          let starterSelected = starter[0].selected;
          let starterSuit = starter[0].suit;
          let starterValue = starter[0].value;
          let starterHidden = starter[0].hidden;
          let starterRank = starter[0].rank;

          if (starterSelected && turn === playerEl.classList[0]) {
            var answer = confirm('Do you want to switch?');
            if (answer) {
              for (key in hand) {
                let fbSuit = hand[key]['suit'];
                let fbValue = hand[key]['value'];
                let fbHidden = hand[key]['hidden'];
                let fbRank = hand[key]['rank'];
                let fbSelected = hand[key]['selected'];


                if (hand[key]['suit'] === suit && hand[key]['value'].toString() === value) {

                    hand[key]['suit'] = starterSuit;
                    hand[key]['value'] = starterValue;
                    hand[key]['hidden'] = starterHidden;
                    hand[key]['rank'] = starterRank;
                      
                    playerEl.innerHTML='';
                    getFBHand(playerEl, hand);
                    playerHand.set(hand);

                    starter[0].suit = fbSuit;
                    starter[0].value = fbValue;
                    starter[0].rank = fbRank;
                    starter[0].selected = false;
                    
                    passRef.set(false);
                    starterEl.innerHTML = '';
                    getStarter(starterEl, starter);
                    starterRef.set(starter);

                    switchTurns(playerEl.classList[0]);

                    lastTurnRef.once('value', (snap)=> {
                    let last = snap.val();

                      if (last) {
                        for (key in hand) {
                          hand[key]['hidden'] = false;
                        }
                        playerEl.innerHTML='';
                        getFBHand(playerEl, hand);
                        playerHand.set(hand);
                        checkAllVisible(hand, playerEl.classList[0], playerScore);
                      } else {
                        checkAllVisible(hand, playerEl.classList[0], playerScore);
                      }

                    });

                }


              }

            }
          }

        }


            for (key in hand) {
              // check how many cards in the hand are hidden
              let fbHidden = hand[key]['hidden'];

              if (fbHidden == false) {
                count++
              }

            }

            for (key in hand) {

              let fbSuit = hand[key]['suit'];
              let fbValue = hand[key]['value'];
              let fbHidden = hand[key]['hidden'];

              if (count >= 2) {

              } else 

              if (fbSuit === suit && fbValue.toString() === value) {
                  if (fbHidden) {
                    hand[key]['hidden'] = false;
                  }

                    playerEl.innerHTML='';

                    getFBHand(playerEl, hand);
                    
                    playerHand.set(hand);

                } 
            } 
       });

       });  
  });

}


// tell user the game works better in landscape mode
function detectLandscape() {
  if (window.innerWidth < window.innerHeight) {
    alert('This game works best with your phone in landscape mode!');
  }
}

detectLandscape();

/*
lucky semicolon, don't touch
;
*/