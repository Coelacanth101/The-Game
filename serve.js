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
const maxPlayer = 5
let playersName = []
let m = 1
while(m <= maxPlayer){
  playersName.push('')
  m += 1
}

class Player{
  constructor(name, number, socketID){
    this.name = name;
    this.number = number;
    this.socketID = socketID
    this.hand = [];
    this.toDraw = 0;
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
      display.backgroundAllDelete()
      if(this.targetBox.direction === 'up'){
        if(this.playingCard > this.targetBox.current || this.playingCard === this.targetBox.current - 10){
          this.discard(this.playingCard)
          this.targetBox.pool.push(this.playingCard)
          this.targetBox.current = this.playingCard
          this.toDraw += 1
          /*display.allHands()*/
          display.myHand(this)
          display.field()
        }
      }else if(this.targetBox.direction === 'down'){
        if(this.playingCard < this.targetBox.current || this.playingCard === this.targetBox.current + 10){
          this.discard(this.playingCard)
          this.targetBox.pool.push(this.playingCard)
          this.targetBox.current = this.playingCard
          this.toDraw += 1
          /*display.allHands()*/
          display.myHand(this)
          display.field()
        }
      }
      this.playingCard = ''
      this.targetBox = ''
    }
  };
  draw(){
    while(this.toDraw > 0){
      if(game.deck.length > 0){
        let randomNumber = Math.floor(Math.random()*game.deck.length);
        let card = game.deck[randomNumber]
        this.hand.push(card);
        game.deck.splice(randomNumber,1);
        this.toDraw -= 1
      }else{
        break
      }
    }
  };
  turnEnd(){
    this.playingCard = ''
    this.targetBox = ''
    display.boxDelete()
    this.draw()
    game.turnEnd()
  };
  resetMyself(){
    this.hand = [];
    toDraw = 0;
    this.playingCard = ''
    this.targetBox = ''
  };
  refresh(){
    this.hand = [];
    this.toDraw = 0;
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
    this.pool =[100];
    this.current = 100;
  },
}
const box4 = {pool:[100], current:100, direction:'down',
  refresh(){
    this.pool =[100];
    this.current = 100;
  },
}

const game = {maxPlayer:maxPlayer, players:[], turnPlayer:'', phase:'nameinputting', boxes:[box1, box2, box3, box4], deck:[],
  playerMake(){
    let i = 1
    this.players = []
    while(i <= playersName.length){
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
    this.phase = 'playing'
  },
  gameStart(){
    this.phase = 'playing'
    this.playerMake();
    let i = 1
    while(i <= maxPlayer){
      playersName[i-1] = ''
      i += 1
    }
    this.turnPlayer = this.players[0]
    this.deckMake();
    this.deal()
    display.playerSort();
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
    this.deck = []
    let i = 2
    while(i <= 99){
      this.deck.push(i)
      i += 1
    }
  },
  deal(){
    let n;
    switch(this.players.length){
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
    for(let p of this.players){
        let i = 1;
        while(i <= n){
            let randomNumber = Math.floor(Math.random()*this.deck.length);
            let card = this.deck[randomNumber]
            p.hand.push(card);
            this.deck.splice(randomNumber,1);
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
    display.allHands()
    display.field()
  },
  arrayHasID(array, ID){
    for(let item of array){
      if(item.socketID === ID){
        return true;
      }
    }
    return false
  },
  takeOver(player){
    this.players[player.number].socketID = player.socketID
  },
  initialize(){
    this.players.length = 0;
    this.refresh()
    this.phase = 'nameinputting'
  },
}

const display = {
  hideItems(){
    io.emit('hideItems', game);
  },
  hideMyItems(socketID){
    let nop = game.players.length
    io.to(socketID).emit('hidemyitems', nop)
  },
  name(){
    io.emit('name', game);
  },
  allHands(){
    io.emit('allHands', game);
  },
  myHand(player){
    io.emit('myHand', player)
  },
  field(){
      io.emit('field', game)
  },
  nextButtonHIde(){
      let a = ''
      io.emit('nextButtonHide', a)
  },
  matchResult(){
      let data = {championname:game.champion.name, players:game.copyOfPlayers()}
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
  handRed(player){
    io.emit('handRed', player)
  },
  handClear(){
    let player = game.turnPlayer
    io.emit('handClear', player)
  },
  boxRed(boxNumber){
    io.emit('boxRed', boxNumber)
  },
  boxDelete(){
    let e = ''
    io.emit('boxDelete', e);
  },
  initialize(){
    let maxPlayer = game.maxPlayer
    io.emit('yesbuttonclick',maxPlayer)
  },
  turnPlayer(){
    let tn = game.turnPlayer.number
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
  playerSort(){
    let players = game.players
    io.emit('playersort', players)
  },
  log(a){
    io.emit('log', a)
  },
}
function discard(item,list){
  if(list.includes(item)){
      let i = list.indexOf(item);
      list.splice(i, 1);
  }
}

io.on("connection", (socket)=>{

  //画面の表示
  if(game.phase === 'nameinputting'){
    io.to(socket.id).emit("nameDisplay", (playersName));
  }else{
    display.name();
    display.allHands();
    display.hideItems();
    display.field()
    display.turnPlayer();
  }
  
  //名前の入力
  socket.on("nameInput", (namedata)=>{
    if(!game.arrayHasID(playersName, socket.id)){
      playersName[namedata.number] = {name:namedata.name, socketID:namedata.socketID};
      io.emit("nameInput", namedata);     
    }
  });

  //スタートボタンクリック
  socket.on('start', (e)=>{
    let i = 1
    while(i <= maxPlayer){
        discard('', playersName);
        i += 1;
    };
    if(playersName.length >= 1){
      game.gameStart()
    };
  });

  //手札を選択
  socket.on('handclick', (data)=>{
    if(data.socketID === game.turnPlayer.socketID){
      game.turnPlayer.playingCard = data.cardNumber
      let player = game.turnPlayer
      display.handRed(player)
      player.play()
    }
  });

  //箱を選択
  socket.on('boxclick', (data)=>{
    if(data.socketID === game.turnPlayer.socketID){
      let boxNumber = data.boxNumber
      game.turnPlayer.targetBox = game.boxes[boxNumber - 1]
      display.boxRed(boxNumber)
      game.turnPlayer.play()
    }
  })


  //開始に同意する
  socket.on('startbuttonclick', (data)=>{
    let n = data.number
    let p = game.players[n]
    p.startOK();
    io.emit('startbuttonclick', n)
  })

  //カードを場に出す
  socket.on('playbuttonclick', (player)=>{
    let n = player.number
    let p = game.players[n]
    p.playCards();
  })
  
  //もう一度遊ぶ
  socket.on('newgamebuttonclick', (e)=>{
    game.newGame();
  })

  //初期化
  
  socket.on('yesbuttonclick', (e)=>{
    display.initialize()
    game.initialize()
  })

  //継承
  socket.on('takeoverbuttonclick', (player)=>{
    game.takeOver(player)
    display.takeOver(player)
    display.playerSort()
    display.name();
    display.allHands();
    display.hideItems();
    display.field()
    display.turnPlayer();
  })

  //ターン終了
  socket.on('endbuttonclick', (player)=>{
    let n = player.number
    let p = game.players[n]
    if(p === game.turnPlayer && p.toDraw >= 2){
        p.turnEnd();
    };
  })





  //コンソールに表示
  socket.on('console',(e)=>{
    socket.emit('console', game)
  })
})