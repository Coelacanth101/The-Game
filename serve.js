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
  }
  resetMyself(){
    this.hand = [];
    toDraw = 0;
    this.playingCard = ''
    this.targetBox = ''
  };
}

const box1 = {pool:[1], current:1, direction:'up'}
const box2 = {pool:[1], current:1, direction:'up'}
const box3 = {pool:[100], current:100, direction:'down'}
const box4 = {pool:[100], current:100, direction:'down'}

const master = {turnPlayer:'', phase:'nameinputting',
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

const game = {players:players, box1:box1, box2:box2, box3:box3, box4:box4}

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
    let players = []
    for(let p of master.players){
      let player = {number:'',socketID:'',hand:[], name:'', gain:0, chip:0, doubleAction:1, score:0}
      player.number = p.number;
      player.socketID = p.socketID;
      player.name = p.name
      player.gain = p.gain;
      player.chip = p.chip;
      player.doubleAction = p.doubleAction;
      player.score = p.score
      for(c of p.hand){
        let card = {name:'', index:'', position:''}
        card.name = c.name;
        card.index = c.index;
        card.position = c.position;
        player.hand.push(card)
      }
      players.push(player)
    }
    io.emit('name', players);
  },
  gain(player){
    io.emit('gain', player);
  },
  chip(player){
    io.emit('chip', player);
  },
  doubleaction(player){
    io.emit('doubleaction', player);
  },
  score(player){
    io.emit('score', player);
  },
  allHands(){
    let players = []
    for(let p of master.players){
      let player = {number:'',socketID:'',hand:[], name:''}
      player.number = p.number;
      player.socketID = p.socketID;
      player.name = p.name
      for(c of p.hand){
        let card = {name:'', index:'', position:''}
        card.name = c.name;
        card.index = c.index;
        card.position = c.position;
        player.hand.push(card)
      }
      players.push(player)
    }
    io.emit('allHands', players);
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
  roundResult(){
      let data = {round:master.round, players:server.copyOfPlayers()}
      io.emit('roundResult', data)
  },
  matchResult(){
      let data = {championname:master.champion.name, players:server.copyOfPlayers()}
      io.emit('matchResult', data)
  },
  hideResult(){
    let a = ''
    io.emit('hideResult', a)
  },
  startButton(){
    let a = ''
    io.emit('startButton', a)
  },
  reverseButton(){
    let a = ''
    io.emit('reverseButton', a)
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


const server = {
  arrayHasID(array, ID){
    for(let item of array){
      if(item.socketID === ID){
        return true;
      }
    }
    return false
  },
  discard(item,list){
    if(list.includes(item)){
        let i = list.indexOf(item);
        list.splice(i, 1);
    }
  },
  nameToCard(name){
    for(c of allCards){
        if(c.name === name){
            return c;
        };
    };
  },
  copyOf(playerobj){
    let player = {number:'',socketID:'',hand:[], name:'', gain:0, chip:0, doubleAction:1, score:0, lastScore:0}
          player.number = playerobj.number;
          player.socketID = playerobj.socketID;
          player.name = playerobj.name
          player.gain = playerobj.gain;
          player.chip = playerobj.chip;
          player.doubleAction = playerobj.doubleAction;
          player.score = playerobj.score
          player.lastScore = playerobj.lastScore
          for(c of playerobj.hand){
            let card = {name:'', index:'', position:''}
            card.name = c.name;
            card.index = c.index;
            card.position = c.position;
            player.hand.push(card)
          }
    return player
  },
  copyOfPlayers(){
    let players = []
    for(p of master.players){
      players.push(this.copyOf(p))
    }
    return players
  },
  copyOfCard(cardobj){
    let card = {name:'', index:'', position:''}
    card.name = cardobj.name;
    card.index = cardobj.index;
    card.position = cardobj.position;
    return card
  },
  recordLog(){
    for(c of master.usingCards){
      c.recordLog()
    }
    for(p of master.players){
      p.recordLog()
    }
    master.recordLog()
  },
  undo(){
    for(c of master.usingCards){
      c.undo()
    }
    for(p of master.players){
      p.undo()
    }
    master.undo()
    display.field()
    display.allHands()
    display.name()
    display.turnPlayer()
  }
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
    if(!server.arrayHasID(playersName, socket.id)){
      playersName[namedata.number] = {name:namedata.name, socketID:namedata.socketID};
      io.emit("nameInput", namedata);     
    }
  });

  //スタートボタンクリック
  socket.on('start', (e)=>{
    let i = 1
    let arr = playersName.slice(0, playersName.length)
    while(i <= 8){
        server.discard('', playersName);
        i += 1;
    };
    nop = playersName.length;
    if(nop >= 3){
      master.gameStart()
      let i = 1
      while(i <= 5){
        playersName[i-1] = ''
        i += 1
      }
    }else{
      playersName = arr
    }
  });

  //手札を選択
  socket.on('handclick', (data)=>{
    let thisCard = server.nameToCard(data.cardName)
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

  //カードをひっくり返す
  socket.on('reversebuttonclick', (n)=>{
    let p = master.players[n]
    p.reverseHand();
  })

  //スカウトするカードを選択
  socket.on('fieldcardclick', (data)=>{
    if(data.socketID === master.turnPlayer.socketID){
      let thisCard = server.nameToCard(data.cardName)
      if(thisCard === master.fieldCards.cards[0] || thisCard === master.fieldCards.cards[master.fieldCards.cards.length -1]){
        master.turnPlayer.choiceCandidate(thisCard)
      }
    }
  })

  //そのままスカウトする
  socket.on('stayscoutbuttonclick', (player)=>{
    let n = player.number
    let p = master.players[n]
    if(p === master.turnPlayer){
        p.stayScout();
    };
  });

  
  //ひっくり返してスカウトする
  socket.on('reversescoutbuttonclick', (player)=>{
    let n = player.number
    let p = master.players[n]
    if(p === master.turnPlayer){
        p.reverseScout();
    };
  });


  //ダブルアクション
  socket.on('doublebuttonclick', (player)=>{
    let n = player.number
    let p = master.players[n]
    if(p === master.turnPlayer){
        p.double();
    };
  })

  //次のラウンド
  socket.on('nextroundbuttonclick', (e)=>{
    display.nextButtonHIde()
    display.hideResult()
    master.nextRound()
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