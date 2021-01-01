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
// console.log(gameKey);

// create a firebase node with the game's unique key
let gameListRef = firebase.database().ref(`gameList_${gameKey}`);
gameListRef.push();

let DeckReference = firebase.database().ref(`gameKey_${gameKey}`);
let deckRef = DeckReference.child('deckoCards');
let turnRef = DeckReference.child('turns');
let lastTurnRef = DeckReference.child('lastTurns')
let passRef = DeckReference.child('passVisible');
let Player1Ref = DeckReference.child('player1');
let player1HandRef = Player1Ref.child('player1Hand');
let player1ScoreRef = Player1Ref.child('player1score');
// let player1TurnRef = Player1Ref.child('player1turn');
let Player2Ref = DeckReference.child('player2');
let player2HandRef = Player2Ref.child('player2Hand');
let player2ScoreRef = Player2Ref.child('player2score');
// let player2TurnRef = Player2Ref.child('player2turn');
let Player3Ref = DeckReference.child('player3');
let player3HandRef = Player3Ref.child('player3Hand');
let player3ScoreRef = Player3Ref.child('player3score');
// let player3TurnRef = Player3Ref.child('player3turn');
let Player4Ref = DeckReference.child('player4');
let player4HandRef = Player4Ref.child('player4Hand');
let player4ScoreRef = Player4Ref.child('player4score');
// let player4TurnRef = Player4Ref.child('player4turn');
// let count1Ref = DeckReference.child('count1');
// let count2Ref = DeckReference.child('count2');
// let crib1Ref = DeckReference.child('crib1');
// let crib2Ref = DeckReference.child('crib2');
let starterRef = DeckReference.child('starter');
let discardedCardsRef = DeckReference.child('discardedCards');

// let scoreboardRef = DeckReference.child('scoreboard');
// let autoCribRef = DeckReference.child('autoCrib'); 
// let counterRef = DeckReference.child('counter');
// let coinFlipRef = DeckReference.child('coinFlip');
let resetRef = DeckReference.child('reset');

//set the player hands to empty on page load
player1HandRef.set({player1Cards:[]});
player1ScoreRef.set(0);
// player1TurnRef.set(true);
player2HandRef.set({player2Cards:[]});
player2ScoreRef.set(0);
// player2TurnRef.set(false);
player3HandRef.set({player3Cards:[]});
player3ScoreRef.set(0);
// player3TurnRef.set(false);
player4HandRef.set({player4Cards:[]});
player4ScoreRef.set(0);
// player4TurnRef.set(false);
discardedCardsRef.set({discardedCards:[]});
turnRef.set('player1');
passRef.set(false);
lastTurnRef.set(false);


// count1Ref.set({count:[]});
// count2Ref.set({count:[]});
// crib1Ref.set({crib:[]});
// crib2Ref.set({crib:[]});
// starterRef.set({starter:[]})
// scoreboardRef.set({score1: 0, score2: 0});
// autoCribRef.set({fbAutoCrib1: 0, fbAutoCrib2: 0});
// counterRef.set(0);
resetRef.set(false);
// coinFlipRef.set({ player1: '', player2: '' });

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

  deal(cards) {
    let hand = [];
    while(hand.length < cards) {
      hand.push(this.deck.pop());
    }
    deckRef.set(this.deck);
    return hand;
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

//make player hands
// let player1Hand = [];
let player2Hand = [];
let turn = true;
// let autoCrib1 = 0;
// let autoCrib2 = 0;

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

let starterEl = document.querySelector('.starter');
let player1PotEl = document.querySelector('.player1-pot');
let player2PotEl = document.querySelector('.player2-pot');

// Score Elements
let player1ScoreEl = document.querySelector('#player1Score');
let player2ScoreEl = document.querySelector('#player2Score');
let player3ScoreEl = document.querySelector('#player3Score');
let player4ScoreEl = document.querySelector('#player4Score');

//get button elements
let dealButton = document.querySelector('#dealEl');
let resetButton = document.querySelector('#resetEl');

// get count element
let countEl = document.querySelector('.count');

// let $showButton1 = $('.show-hand-1');
// let $showButton2 = $('.show-hand-2');
// let $cribButton1 = $('.show-crib-1');
// let $cribButton2 = $('.show-crib-2');

// $showButton1.click(()=>{
//   // $player1El.toggleClass('hide');
//   $hand1Curtain.slideToggle();
// });

// $showButton2.click(()=>{
//   // $player2El.toggleClass('hide');
//   $hand2Curtain.slideToggle();
// });

// $cribButton1.click(()=>{
//   // $player1Crib.toggleClass('hide');
//   $('.crib1-curtain').slideToggle();
// });

// $cribButton2.click(()=>{
//   // $player2Crib.toggleClass('hide')
//   $('.crib2-curtain').slideToggle();
// });

// determine if player 1 or 2
// coinFlipRef.once('value', (snap) => {
//   let val = snap.val();
//   console.log(val);
//   if(!val) {
//     val = {player1: "Player 1", player2: ""};
//     console.log(val);
//     $hand1Curtain.hide();
//     player2El.classList.add('hide', 'noClick');
//     coinFlipRef.set(val);
//     $showButton2.addClass('hide noClick');
//     showModal(val.player1);
//   } else if(val.player1 === "Player 1") {
//     val.player2 = 'Player 2';
//     console.log(val);
//     $hand2Curtain.hide();
//     player1El.classList.add('hide', 'noClick');
//     coinFlipRef.set(val);
//     $showButton1.addClass('hide noClick');
//     showModal(val.player2);
//   }
// })

// function showModal(playerNum) {
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

// function closeModal() {
//   document.querySelector('.modal').classList.add('hide-modal');
// }

// update firebase score reference when click scorboard element
// player1ScoreEl.addEventListener('input', (e) => {

//   scoreboardRef.once('value', (snap) => {
//     let fbScore = snap.val();
//     // console.log(fbScore);
//     let score = player1ScoreEl.value;
//     fbScore.score1 = score;
//     scoreboardRef.set(fbScore);
//     score = fbScore.score1;
//   })
// })

// player2ScoreEl.addEventListener('input', (e) => {

//   scoreboardRef.once('value', (snap) => {
//     let fbScore = snap.val();
//     // console.log(fbScore);
//     let score = player2ScoreEl.value;
//     fbScore.score2 = score;
//     scoreboardRef.set(fbScore);
//     score = fbScore.score2;
//   })
// })

// scoreboardRef.on('value', (snap) => {
//   player1ScoreEl.value = snap.val().score1;
//   player2ScoreEl.value = snap.val().score2;
// })

//===================================
// Reset all values except scoreboard
// on reset button click
//===================================
resetButton.addEventListener('click', (e) => {
  e.preventDefault();

  resetRef.once('value', (snap)=>{
    let val = snap.val();
    val = !val;
    resetRef.set(val);
  })
})

resetRef.on('value', (snap)=> {
  //set the player hands to empty on page load
  player1HandRef.set({player1Cards:[]});
  player2HandRef.set({player2Cards:[]});
  player3HandRef.set({player3Cards:[]});
  player4HandRef.set({player4Cards:[]});
  // count1Ref.set({count:[]});
  // count2Ref.set({count:[]});
  // crib1Ref.set({crib:[]});
  // crib2Ref.set({crib:[]});
  player1ScoreRef.set(0);
  player2ScoreRef.set(0);
  player3ScoreRef.set(0);
  player4ScoreRef.set(0);

  // player1TurnRef.set(true);
  // player2TurnRef.set(false);
  // player3TurnRef.set(false);
  // player4TurnRef.set(false);


  turnRef.set('player1');
  passRef.set(false);
  lastTurnRef.set(false);


  starterRef.set([]);
  discardedCardsRef.set({discardedCards:[]});
  // counterRef.set(0);
  // autoCribRef.set({fbAutoCrib1: 0, fbAutoCrib2: 0});

  // create a new deck and shuffle it
  cardDeck = new Deck();
  cardDeck.createDeck(suits, values, ranks);
  cardDeck.shuffle();

  // reset the player hand arrays and the turn boolean
  // player1Hand = [];
  player2Hand = [];
  turn = true;
  // autoCrib1 = 0;
  // autoCrib2 = 0;

  //reset the pot elements on click (in case there's a glitch)
  // player1PotEl.innerHTML = '';
  // player2PotEl.innerHTML = '';
});

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
  deckRef.once('value', (snap)=>{
    let fbDeck = snap.val();
    let p1hand = fbDeck.slice(0, 6);
    let p2hand = fbDeck.slice(6, 12);
    let p3hand = fbDeck.slice(12, 18);
    let p4hand = fbDeck.slice(18, 24);

    fbDeck = fbDeck.slice(24, 52);

    for (let i = 0; i < p1hand.length; i++) {
        player1HandRef.push().set(p1hand[i]);
      }

    for (let i = 0; i < p2hand.length; i++) {
        player2HandRef.push().set(p2hand[i]);
      }

    for (let i = 0; i < p3hand.length; i++) {
        player3HandRef.push().set(p3hand[i]);
      }

    for (let i = 0; i < p4hand.length; i++) {
        player4HandRef.push().set(p4hand[i]);
      }

      let starter = fbDeck[0];
      starter.hidden = false;
      starterRef.push(starter);
      starterRef.on('value', function(snapshot) {
          let hand = snapshotToArray(snapshot);
          starterRef.set(hand);
      });

    fbDeck.shift();
    deckRef.set(fbDeck);
  });
};

//listen for change in value of player 1 hand
//then creates an html element with that suit and value
player1HandRef.on('value', (snap)=>{
  let hand = snap.val();
  //reset the players hand element
  player1El.innerHTML='';
  // console.log('render Player 1 hand');
  getFBHand(player1El, hand);
});


player1ScoreRef.on('value', (snap)=>{
  let score = snap.val();
  //reset the players hand element
  player1ScoreEl.innerHTML='';
  // console.log('render Player 1 hand');
  getScore(player1ScoreEl, score);
});

//listen for change in value of player 2 hand
//then creates an html element with that suit and value
player2HandRef.on('value', (snap)=>{
  let hand = snap.val();
  //reset player hand element
  player2El.innerHTML='';
  // console.log('render Player 2 hand');
  getFBHand(player2El, hand);
})


player2ScoreRef.on('value', (snap)=>{
  let score = snap.val();
  //reset the players hand element
  player2ScoreEl.innerHTML='';
  // console.log('render Player 1 hand');
  getScore(player2ScoreEl, score);
});


player3HandRef.on('value', (snap)=>{
  let hand = snap.val();
  //reset player hand element
  player3El.innerHTML='';
  // console.log('render Player 2 hand');
  getFBHand(player3El, hand);
})

player3ScoreRef.on('value', (snap)=>{
  let score = snap.val();
  //reset the players hand element
  player3ScoreEl.innerHTML='';
  // console.log('render Player 1 hand');
  getScore(player3ScoreEl, score);
});


player4HandRef.on('value', (snap)=>{
  let hand = snap.val();
  //reset player hand element
  player4El.innerHTML='';
  // console.log('render Player 2 hand');
  getFBHand(player4El, hand);
})

player4ScoreRef.on('value', (snap)=>{
  let score = snap.val();
  //reset the players hand element
  player4ScoreEl.innerHTML='';
  // console.log('render Player 1 hand');
  getScore(player4ScoreEl, score);
});


starterRef.on('value', (snap)=>{
  let hand = snap.val();
  console.log(hand);
  starterEl.innerHTML = '';
  getStarter(starterEl, hand);
})

passRef.on('value', (snap)=>{
  let passVis = snap.val();
  console.log(passVis);
  // starterEl.innerHTML = '';
  // getStarter(starterEl, hand);
})

// crib1Ref.on('value', (snap)=>{
//   let hand = snap.val();
//   player1CribEl.innerHTML = '';
//   getFBHand(player1CribEl, hand);
// })

// crib2Ref.on('value', (snap)=>{
//   let hand = snap.val();
//   player2CribEl.innerHTML = '';
//   getFBHand(player2CribEl, hand);
// })

// count1Ref.on('value', (snap)=>{
//   let hand = snap.val();
//   // let val = document.querySelector('input[name="cribPotRadio"]:checked').value;
//   autoCribRef.once('value', (snap) => {
//     let val = snap.val();
//     if(val.fbAutoCrib1 === 2) {
//       console.log('render POT1');
//       player1PotEl.innerHTML = '';
//       getFBHand(player1PotEl, hand);
//     } else if(val.fbAutoCrib1 < 2) {
//       // console.log('render CRIB1');
//       player1CribEl.innerHTML = '';
//       getFBHand(player1CribEl, hand)
//     }
//   })
// })

// count2Ref.on('value', (snap)=>{
//   let hand = snap.val();
//   // let val = document.querySelector('input[name="cribPotRadio"]:checked').value;
//   autoCribRef.once('value', (snap) => {
//     let val = snap.val();

//     if(val.fbAutoCrib2 === 2) {
//       console.log('render POT2')
//       player2PotEl.innerHTML = '';
//       getFBHand(player2PotEl, hand);
//     } else if(val.fbAutoCrib2 < 2) {
//       // console.log('render CRIB2')
//       player2CribEl.innerHTML = '';
//       getFBHand(player2CribEl, hand)
//     }
//   })
// })

// counterRef.on('value', (snap) => {
//   let count = snap.val();
//   countEl.innerHTML = count;
// })

//this runs every time there is a change in a player's hand in the database
//for each key in hand, create HTML element and append to hand element
function getFBHand(handEl, hand){
  for(key in hand){
    // console.log(key);
    let suit = hand[key].suit;
    let value = hand[key].value;
    let hidden = hand[key].hidden;
    let cardEl = document.createElement('div');
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
    handEl.appendChild(cardEl);
  }
}


function getScore(player, score)  {
    player.innerHTML = score;
}


function getStarter(handEl, hand) {

    let passVis;

    passRef.on('value', (snap)=>{
      passVis = snap.val();
    })

    console.log(passVis);

    if (passVis) {
      handEl.innerHTML = `<div id="pass"><button id="pass">Pass</button></div>`;
    } else {
      handEl.innerHTML = `<div id="deck" class="hide card"></div>`;
    }

    console.log(hand);

    for(key in hand){
      let suit = hand[key].suit;
      let value = hand[key].value;
      let cardEl = document.createElement('div');
      let selected = hand[key].selected;
      if (selected) {
        cardEl.classList.add('selected');
      } else {
        cardEl.classList.remove('selected');
      }

      if (suit === "Joker") {
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

};


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


    function columns (column, a, b, c , d) {
      var columnScore;

      if (a === b) {
        columnScore = 0
      } else {
        columnScore = c + d
      }
      return columnScore
    }

     column1 = columns(column1, values[0], values[3], ranks[0], ranks[3]);
     column2 = columns(column2, values[1], values[4], ranks[1], ranks[4]);
     column3 = columns(column3, values[2], values[5], ranks[2], ranks[5]);

     score = column1 + column2 + column3;
                    
     pScore.set(score);

     getScore(player, score);

}




starterEl.addEventListener('click', (e)=>{


     if (checkForStart() >= 8){

      let card = e.target.closest('div');
      let count;

      deckRef.once('value', (snap)=>{
        let deck = snap.val();
        count = deck.length;

      // discardedCardsRef.once('value', (snap)=>{
      //   let discards = snap.val();
      // });


      starterRef.once('value', (snap)=>{
      let hand = snap.val();


          if (card === document.getElementById('deck')) {

            if (count === 1) {
               discardedCardsRef.once('value', (snap)=>{
               let discarded = snap.val();
               discardedCardsRef.set({discardedCards:[]});
               console.log(discarded);
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
                console.log(starter);
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

                console.log(hand);
                let starter = hand;

                starterEl.innerHTML = '';
                starter[0].hidden = false;
                passRef.set(false);
                getStarter(starterEl, starter);
                starterRef.set(starter);

              
              console.log('passed');
              


          } 
          else {

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
      });


    } else {}
 
});

player1El.addEventListener('click', (e)=>{

  //get nearest card element to the target
  let card = e.target.closest('div.card');

  //get the suit and card value for the card that was clicked
  let suit = card.classList[0];
  let value = card.classList[1];

  selectCard(suit, value, player1HandRef, player1ScoreRef, player1El);

});

player2El.addEventListener('click', (e)=>{

  //get nearest card element to the target
  let card = e.target.closest('div.card');

  //get the suit and card value for the card that was clicked
  let suit = card.classList[0];
  let value = card.classList[1];

  selectCard(suit, value, player2HandRef, player2ScoreRef, player2El);

});

player3El.addEventListener('click', (e)=>{

  //get nearest card element to the target
  let card = e.target.closest('div.card');

  //get the suit and card value for the card that was clicked
  let suit = card.classList[0];
  let value = card.classList[1];

  selectCard(suit, value, player3HandRef, player3ScoreRef, player3El);

});

player4El.addEventListener('click', (e)=>{

  //get nearest card element to the target
  let card = e.target.closest('div.card');

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
      
        turnRef.once('value', (snap)=> {
        let turn = snap.val();
  
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
                  console.log(starter);
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
                    playerHand.set();
                    checkAllVisible(hand, playerEl.classList[0], playerScore);
                  }

                  });

                  console.log(playerScore);

                  checkAllVisible(hand, playerEl.classList[0], playerScore);

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