const socket = io();

//画面初期化
$('#initializebutton').on('click', function(){
    $('#yesorno').show()
})
$('#yesbutton').on('click', function(){
    let e =''
    socket.emit('yesbuttonclick', e)
})
$('#nobutton').on('click', function(){
    $('#yesorno').hide()
})

//名前の入力発信
$('#nameinputarea').on('click', '.namebutton', function(){
    if($(this).prev().val()){
        myName = $(this).prev().val()
        let nameNumber = Number($(this).prev().data('namenumber'));
        namedata = {name:myName, number:nameNumber, socketID:socket.id}
        socket.emit("nameInput", namedata)
    }
})

//名前の入力受信
socket.on("nameInput", (namedata)=>{
    $(`.player${namedata.number}`).html(`<p><strong>${namedata.name}</strong></p>`)
})

//スタートボタンクリック発信
$('#gamestartbutton').on('click', function(){
    let e
    socket.emit('start', e)
})

//入力済みの名前表示
socket.on('nameDisplay', (playersName)=>{
    let i = 1
    for(let player of playersName){
        if(player.name){
            $(`.player${playersName.indexOf(player)}`).html(`<p><strong>${player.name}</strong></p>`)
        }
        i += 1
    }
})

socket.on('hideItems', (game)=>{
    display.hideItems(game)
});
socket.on('name', (game)=>{
    display.name(game)
});

socket.on('allHands', (game)=>{
    display.allHands(game)
});
socket.on('myHand', (player)=>{
    display.myHand(player)
});
socket.on('field', (game)=>{
    display.field(game)
});
socket.on('startButton', ()=>{
    display.startButton()
});
socket.on('backgroundAllDelete', ()=>{
    display.backgroundAllDelete()
});
socket.on('backgroundDelete', (card)=>{
    display.backgroundDelete(card)
});
socket.on('handRed', (player)=>{
    display.handRed(player)
});
socket.on('handClear', (player)=>{
    display.handClear(player)
})
/*socket.on('startbuttonclick', (n)=>{
    display.startButtonHide(n)
});*/
socket.on('boxRed', (boxNumber)=>{
    display.boxRed(boxNumber)
});
socket.on('boxClear', (card)=>{
    display.boxClear(card)
});
socket.on('boxDelete',(e)=>{
    display.boxDelete()
})
socket.on('yesbuttonclick', (maxPlayer)=>{
    display.initialize(maxPlayer)
});
socket.on('turnplayer', (tn)=>{
    display.turnPlayer(tn)
})
socket.on('turnplayerdelete', ()=>{
    display.turnPlayerDelete()
})
socket.on('takeoverbuttonclick', (player)=>{
    display.takeOver(player)
})
socket.on('hidemyitems',(nop)=>{
    display.hideMyItems(nop)
})
socket.on('toggletakeoverbutton',()=>{
    display.toggleTakeOver()
})
socket.on('log', (a)=>{
    display.log(a)
})
socket.on('playersort', (players)=>{
    display.playerSort(players)
})


//手札を選択
$('#players').on('click', '.player .hand .card', function(){
    if($(this).parent().parent().data('socketid') === socket.id){
        const cardNumber = Number($(this).attr('id'))
        let data = {cardNumber:cardNumber, socketID:socket.id}
        socket.emit('handclick', data)
    }
    
})
/*//カードを場に出す
$('.playbutton').on('click',function(){
    if($(this).parent().parent().data('socketid') === socket.id){
        let n = Number($(this).data('playernumber'))
        player ={number:n, socketID:socket.id}
        socket.emit('playbuttonclick', player)
        $(`.card`).css('background-color', '')
    };
})*/


//箱を選択
$('#box').on('click', '.card', function(){
        const boxNumber = Number($(this).data('box'))
        data = {boxNumber:boxNumber, socketID:socket.id}
        socket.emit('boxclick', data)
})

//もう一度遊ぶ
$('#newgamebutton').on('click',function(){
    let e =''
    socket.emit('newgamebuttonclick', e)
});

//継承
$('#players').on('click', '.player .buttonarea .takeoverbutton', function(){
    let n = Number($(this).data('playernumber'))
    let player ={number:n, socketID:socket.id}
    socket.emit('takeoverbuttonclick', player)
});

//ターン終了
$('#players').on('click', '.player .buttonarea .endbutton', function(){
    if($(this).parent().parent().data('socketid') === socket.id){
        let n = Number($(this).data('playernumber'))
        let player ={number:n, socketID:socket.id}
        socket.emit('endbuttonclick', player)
    }
});






//画面表示
const display = {
    hideItems(game){
        let i = 1
        while(i <= game.maxPlayer){
            $(`#player${i-1}`).show()
            i += 1
        }
        i = game.players.length
        while(i <= game.maxPlayer - 1){
            $(`#player${i}`).hide()
            i += 1
        }
        $('#gamestartbutton').hide()
        $('#newgamebutton').hide();
        $('#nameinputarea').hide();
        $('#field').show()
        $('.startbutton').hide()
        $('#players').show();
        this.toggleTakeOver();
    },
    hideMyItems(nop){
        let i = 1
        while(i <= 5){
            $(`#player${i-1}`).show()
            i += 1
        }
        while(nop <= 4){
            $(`#player${nop}`).hide()
            nop += 1
        }
        $('#gamestartbutton').hide();
        $('#newgamebutton').hide();
        $('#nameinputarea').hide();
        $('#field').show()
        $('#players').show();
    },
    name(game){
        for(let p of game.players){
            $(`#player${p.number}`).data('socketid', `${p.socketID}`);
            $(`#player${p.number}name`).html(`${p.name}`);
        }
    },
    allHands(game){
        for(let p of game.players){
            $(`#player${p.number}hand`).html('')
            if(p.socketID === socket.id){
                for(c of p.hand){
                    $(`#player${p.number}hand`).append(`<img src="./${c}.png" id="${c}" class="player${p.number}card card" alt="${c}">`);
                };
            }else{
                for(c of p.hand){
                    $(`#player${p.number}hand`).append(`<img src="./back.png" class="player${p.number}card card">`);
                }
            }
        };
    },
    myHand(player){
        $(`#player${player.number}hand`).html('')
        if(player.socketID === socket.id){
            for(c of player.hand){
                $(`#player${player.number}hand`).append(`<img src="./${c}.png" id="${c}" class="player${player.number}card card" alt="${c}">`);
            };
        }else{
            for(c of player.hand){
                $(`#player${player.number}hand`).append(`<img src="./back.png" class="player${player.number}card card">`);
            }
        }
    },
    field(game){
        let i = 1
        for(box of game.boxes){
            $(`#box${i}`).attr('src', `./${box.current}.png`)
            i += 1
        }
        $('#remained').html(`山札残り${game.deck.length}枚`)
    },
    nextButtonHIde(){
        $('#nextroundbutton').hide()
    },
    startButton(){
        $('.startbutton').toggle()
    },
    backgroundAllDelete(){
        $('.card').css('background-color', '');
    },
    backgroundDelete(card){
        $(`#player${card.holderNumber}card${card.index}`).css('background-color', '');
    },
    handRed(player){
        $(`.player${player.number}card`).css('background-color', '');
        $(`#${player.playingCard}`).css('background-color', 'red');
    },
    handClear(player){
        $(`.player${player.number}card`).css('background-color', '');
    },
    gameStartButton(){
        $('#gamestartbutton').toggle()
    },
    boxDelete(){
        $(`.box`).css('background-color', '');
    },
    boxRed(boxNumber){
        $(`.box`).css('background-color', '');
        $(`#box${boxNumber}`).css('background-color', 'red');
    },
    boxclear(card){
        $(`#fieldcard${card.index}`).css('background-color', '');
    },
    initialize(maxPlayer){
        $('#gamestartbutton').show()
        $('#nextroundbutton').hide();
        $('#newgamebutton').hide();
        $('#nameinputarea').show();
        $('#field').hide();
        $('#players').hide();
        $('#yesorno').hide()
        $('#nameinputarea').html('<h1>The Game</h1><h2>名前を入力してください</h2>')
        let i = 1
        while(i <= maxPlayer){
            $('#nameinputarea').append(`<div class="player${i-1}">
                <div class="playername">
                    <input type="text" class="nameinput" data-namenumber="${i-1}">
                    <input type="button" value="決定" class="namebutton">
                </div>
            </div>`)
            i += 1
        }
    },
    turnPlayer(tn){
        let i = 0;
        while(i <= 4){
            $(`#player${i}`).css('border', '0px');
            i += 1
        }
        $(`#player${tn}`).css('border', '5px solid');
        $(`#player${tn}`).css('border-color', 'purple');
    },
    turnPlayerDelete(){
        let i = 0;
        while(i <= 4){
            $(`#player${i}`).css('border', '0px');
            i += 1
        }
    },
    takeOver(player){
        $(`#player${player.number}`).data('socketid', player.socketID)
        this.toggleTakeOver()
    },
    toggleTakeOver(){
        let i = 0;
        let condition = 'watching'
        while(i <= 4){
            if($(`#player${i}`).data('socketid') === socket.id){
                condition = 'playing'
            }
            i += 1
        }
        if(condition === 'playing'){
            $('.takeoverbutton').hide()
        }else{
            $('.takeoverbutton').show()
        }
    },
    showStart(n){
        $(`#startbutton${n}`).show();
        $(`#reversebutton${n}`).show();
    },
    log(a){
        console.log(a)
    },
    playerSort(players){
        let myNumber
        for(p of players){
            if(p.socketID === socket.id){
                $('#players').html('')
                myNumber = p.number
                $('#players').append(
                    `<div id="player${myNumber}" class="player">
                        <div id="player${myNumber}information" class="information"><p id="player${myNumber}name" class="name"></p></div>
                        <div id="player${myNumber}hand" class="hand"></div>
                        <div class="buttonarea">
                            <button id="endbutton${myNumber}" class="endbutton" data-playernumber="${myNumber}">終了</button>
                            <button id="takeoverbutton${myNumber}" class="takeoverbutton" data-playernumber="${myNumber}">継承</button>
                        </div>
                    </div>`
                )
                let i = 1
                while(i <= players.length - 1){
                    if(myNumber === players.length - 1){
                        myNumber = 0
                    }else{
                        myNumber += 1
                    }
                    $('#players').append(
                        `<div id="player${myNumber}" class="player">
                            <div id="player${myNumber}information" class="information"><p id="player${myNumber}name" class="name"></p></div>
                            <div id="player${myNumber}hand" class="hand"></div>
                            <div class="buttonarea">
                                <button id="takeoverbutton${myNumber}" class="takeoverbutton" data-playernumber="${myNumber}">継承</button>
                            </div>
                        </div>`
                    )
                    i += 1
                }
            }
        }
    },
}


//コンソールに表示
function game(){
    let e = ''
    socket.emit('console',e)
}
socket.on('console',(game)=>{
    console.log(game)
})