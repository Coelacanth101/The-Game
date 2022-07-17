const { Console } = require("console");
const { emit } = require("process");
const { brotliCompress } = require("zlib");

//サーバー用変数
const app  = require("express")();
const http = require("http").createServer(app);
const io   = require("socket.io")(http);
const DOCUMENT_ROOT = __dirname + "/static";
const SECRET_TOKEN = "abcdefghijklmn12345";

app.get("/", (req, res)=>{
  res.sendFile(DOCUMENT_ROOT + "/The-Game.html");
});

app.get("/:file", (req, res)=>{
  res.sendFile(DOCUMENT_ROOT + "/" + req.params.file);
});

/**
 * 3000番でサーバを起動する
 */
 http.listen(process.env.PORT || 3000, ()=>{
  console.log("listening on *:3000");
});


/*------------------------------------------
------------------------------------------*/
let playersName = ['','','','','']
let players = [];
let deck = []

class Player{
  constructor(name, number, socketID){
    this.name = name;
    this.number = number;
    this.socketID = socketID
    this.hand = [];
    toDraw = 0;
    this.playingCard = ''
    this.targetBox = ''
  };
  discard(item){
    if(this.hand.includes(item)){
        let i = this.hand.indexOf(item);
        this.hand.splice(i, 1);
    }
  };
  play(){
    if(this.targetBox && this.playingCard){
      if(this.targetBox.direction === 'up'){
        if(this.playingCard > this.targetBox.current || this.playingCard === this.targetBox.current - 10){
          this.discard(this.playingCard)
          this.targetBox.pool.push(this.playingCard)
          this.targetBox.current = card
          this.toDraw += 1
        }
      }else if(this.targetBox.direction === 'down'){
        if(this.playingCard > this.targetBox.current || this.playingCard === this.targetBox.current + 10){
          this.discard(this.playingCard)
          this.targetBox.pool.push(this.playingCard)
          this.targetBox.current = card
          this.toDraw += 1
        }
      }
      this.playingCard = ''
      this.targetBox = ''
    }
  };
  draw(){
    while(this.toDraw > 0){
      let randomNumber = Math.floor(Math.random()*deck.length);
      let card = deck[randomNumber]
      this.hand.push(card);
      deck.splice(randomNumber,1);
      this.toDraw -= 1
    }
  };
  turnEnd(){
    this.draw()
    master.turnEnd()
  };
  resetMyself(){
    this.hand = [];
    toDraw = 0;
    this.playingCard = ''
    this.targetBox = ''
  };
  refresh(){
    this.hand = [];
    toDraw = 0;
    this.playingCard = ''
    this.targetBox = ''
  };
}

const box1 = {pool:[1], current:1, direction:'up',
  refresh(){
    this.pool =[1];
    this.current = 1;
  },
}
const box2 = {pool:[1], current:1, direction:'up',
  refresh(){
    this.pool =[1];
    this.current = 1;
  },
}
const box3 = {pool:[100], current:100, direction:'down',
  refresh(){
    this.pool =[1];
    this.current = 1;
  },
}
const box4 = {pool:[100], current:100, direction:'down',
  refresh(){
    this.pool =[100];
    this.current = 100;
  },
}

const master = {players:[], turnPlayer:'', phase:'nameinputting', boxes:[box1, box2, box3, box4],
  playerMake(){
    let i = 1
    this.players = []
    while(i <= nop){
        let name = playersName[i-1].name
        let number = i-1
        let socketID = playersName[i-1].socketID
        const player = new Player(name, number, socketID)
        this.players.push(player)
        i += 1
    }
  },
  refresh(){
    for(let p of this.players){
        p.refresh();
    }
    for(let b of this.boxes){
      b.refresh();
    }
    this.turnPlayer = ''
    this.phase ='playing'
  },
  gameStart(){
    this.playerMake();
    this.deckMake();
    this.refresh();
    this.deal()
    display.name();
    display.allHands();
    display.field()
    display.hideItems();
    display.turnPlayer();
  },
  arrayHasID(array, ID){
    for(let item of array){
      if(item.socketID === ID){
        return true;
      }
    }
    return false
  },
  deckMake(){
    deck = []
    let i = 2
    while(i <= 99){
      deck.push(i)
      i += 1
    }
  },
  deal(){
    let n;
    switch(players.length){
        case 1:
            n = 8;
            break;
        case 2:
            n = 7;
            break;
        case 3:
            n = 6;
            break;
        case 4:
            n = 6;
            break;
        case 5:
            n = 6;
            break;
    }
    for(let p of players){
        let i = 1;
        while(i <= n){
            let randomNumber = Math.floor(Math.random()*deck.length);
            let card = deck[randomNumber]
            p.hand.push(card);
            deck.splice(randomNumber,1);
            i += 1;
        }
    }
  },
  turnEnd(){
    if(this.players.indexOf(this.turnPlayer) === this.players.length-1){
        this.turnPlayer = this.players[0];
    } else {
        this.turnPlayer = this.players[this.players.indexOf(this.turnPlayer)+1];
    }
    this.turn += 1
    display.turnPlayer()
  },
  arrayHasID(array, ID){
    for(let item of array){
      if(item.socketID === ID){
        return true;
      }
    }
    return false
  },
}

const game = {players:master.players, box1:box1, box2:box2, box3:box3, box4:box4}

const display = {
  hideItems(){
    let nop = master.players.length
    io.emit('hideItems', nop);
  },
  hideMyItems(socketID){
    let nop = master.players.length
    io.to(socketID).emit('hidemyitems', nop)
  },
  name(){
    io.emit('name', game);
  },
  allHands(){
    io.emit('allHands', gane);
  },
  myHand(player){
    io.emit('myHand', player)
  },
  field(){
      let cards = []
      for(c of master.fieldCards.cards){
        let card = {name:'', index:'', position:''}
        card.name = c.name;
        card.index = c.index;
        card.position = c.position
        cards.push(card)
      }
      io.emit('field', cards)
  },
  nextButtonHIde(){
      let a = ''
      io.emit('nextButtonHide', a)
  },
  matchResult(){
      let data = {championname:master.champion.name, players:master.copyOfPlayers()}
      io.emit('matchResult', data)
  },
  hideResult(){
    let a = ''
    io.emit('hideResult', a)
  },
  backgroundAllDelete(){
    let a = ''
    io.emit('backgroundAllDelete', a)
  },
  backgroundDelete(card){
    io.emit('backgroundDelete', card)
  },
  backgroundRed(card){
    io.emit('backgroundRed', card)    
  },
  fieldCardRed(card){
    io.emit('fieldcardred', card)
  },
  fieldCardDelete(card){
    io.emit('fieldcarddelete', card);
  },
  initialize(){
    let a = ''
    io.emit('yesbuttonclick',a)
  },
  turnPlayer(){
    let tn = master.turnPlayer.number
    io.emit('turnplayer', tn)
  },
  turnPlayerDelete(){
    let e = ''
    io.emit('tunplayerdelete', e)
  },
  takeOver(player){
    io.emit('takeoverbuttonclick', player)
  },
  toggleTakeOver(){
    let e = ''
    io.emit('toggletakeoverbutton',e)
  },
  showStart(n){
    io.emit('showstart', n)
  },
  log(a){
    io.emit('log', a)
  },
}


io.on("connection", (socket)=>{

  //画面の表示
  if(master.phase === 'nameinputting'){
    console.log(playersName)
    io.to(socket.id).emit("nameDisplay", (playersName));
  }else{
    display.name();
    display.allHands();
    display.hideItems();
    display.field()
  }
  
  //名前の入力
  socket.on("nameInput", (namedata)=>{
    if(!master.arrayHasID(playersName, socket.id)){
      playersName[namedata.number] = {name:namedata.name, socketID:namedata.socketID};
      io.emit("nameInput", namedata);     
    }
  });

  //スタートボタンクリック
  socket.on('start', (e)=>{
    display.log(game)
    let i = 1
    while(i <= 6){
        master.discard('', playersName);
        i += 1;
    };
    master.gameStart()
    i = 1
    while(i <= 5){
      playersName[i-1] = ''
      i += 1
    }
  });

  //手札を選択
  socket.on('handclick', (data)=>{
    let thisCard = master.nameToCard(data.cardName)
    if(thisCard.holder === master.turnPlayer && master.turn !== 0 && data.socketID === thisCard.holder.socketID){
      master.turnPlayer.choiceScoutPlace(thisCard)
      if(!thisCard.holder.combination.cards.includes(thisCard)){
          let card = {holderNumber:'', index:''}
          card.holderNumber = thisCard.holder.number
          card.index = thisCard.index
          display.backgroundRed(card)
          thisCard.holder.choice(thisCard);
      }else{
          let card = {holderNumber:'', index:''}
          card.holderNumber = thisCard.holder.number
          card.index = thisCard.index
          display.backgroundDelete(card)
          thisCard.holder.cancel(thisCard);
      }
      master.turnPlayer.checkCombination();
    }
  });

  //開始に同意する
  socket.on('startbuttonclick', (data)=>{
    let n = data.number
    let p = master.players[n]
    p.startOK();
    io.emit('startbuttonclick', n)
  })

  //カードを場に出す
  socket.on('playbuttonclick', (player)=>{
    let n = player.number
    let p = master.players[n]
    p.playCards();
  })
  
  //もう一度遊ぶ
  socket.on('newgamebuttonclick', (e)=>{
    master.newGame();
  })

  //初期化
  
  socket.on('yesbuttonclick', (e)=>{
    display.initialize()
    master.initialize()
  })

  //継承
  socket.on('takeoverbuttonclick', (player)=>{
    master.takeOver(player)
    display.takeOver(player)
    display.allHands()
  })

  //ターン終了
  socket.on('endbuttonclick', (player)=>{
    let n = player.number
    let p = master.players[n]
    if(p === master.turnPlayer){
        p.turnEnd();
    };
  })
})