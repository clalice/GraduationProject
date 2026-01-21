var gameWidth3 = 900; // 고정 너비
var gameHeight3 = window.innerHeight; // 현재 화면 높이

var config3 = {
    type: Phaser.AUTO,
    width: gameWidth3,
    height: gameHeight3,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT, // 화면에 맞추기
        autoCenter: Phaser.Scale.CENTER_BOTH // 화면 중앙에 맞춤
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // 중력 변경
            debug: false,
        }
    },
    scene: {
        preload: preload3,
        create: create3,
        update: update3
    }
};

var game3 = new Phaser.Game(config3);

// 리사이즈 이벤트 추가
window.addEventListener('resize', () => {
    game.scale.resize(gameWidth, window.innerHeight * 0.85); 
});

var player3, platforms3, cursors3, timerText3, coinText3, starText3;
let coin3 = 0;
let star3 = 0;
var jumpcount3 = 1;
var hasDoubleJump3 = false;
var time3 = 0;
var arrows3, poisonarrow;
let dropitem3 = 0;

function preload3() {
    this.load.image('sky', './sky.png');
    this.load.image('ground', './ground.png');
    this.load.image('dude', './player.png');
    this.load.image('doubleup', './double_pixel.png');
    this.load.image('portal', './portal.png');
    this.load.image('coin', './coin.png');
    this.load.image('arrow', './arrow.png');
    this.load.image('poisonarrow', './poisonarrow.png');
    this.load.image('star', './star.png');
    this.load.image('jumpPlatform', './jumppad.png');
    this.load.image('Gdown', './gravity_down.png');
    this.load.image('Gup', './gravity_up.png');
}

function create3() {
    this.add.image(450, 300, 'sky');
    platforms3 = this.physics.add.staticGroup();
    createPlatforms3(this);

    player3 = this.physics.add.sprite(200,  gameHeight3 - 80, 'dude');
    player3.setBounce(0.2).setCollideWorldBounds(true);
    this.physics.add.collider(player3, platforms3);

    cursors3 = this.input.keyboard.createCursorKeys();

    createCollectibles3(this);
    createPortal3(this);
    createStar3(this);
    createJumpPlatforms3(this);

    coinText3 = this.add.text(16, 5, 'Coin: 0', { fontSize: '20px', fill: '#fff' });
    timerText3 = this.add.text(16, 30, 'Time: 0', { fontSize: '20px', fill: '#fff' });
    starText3 = this.add.text(16, 55, 'Stars: 0', { fontSize: '20px', fill: '#fff' });

    this.time.addEvent({ delay: 1000, callback: updateTime3, callbackScope: this, loop: true });

    arrows3 = this.physics.add.group();
    this.time.addEvent({ delay: 2000, callback: spawnArrow3, callbackScope: this, loop: true });
    this.physics.add.overlap(player3, arrows3, hitByArrow3, null, this);

    poisonarrows3 = this.physics.add.group();
    this.time.addEvent({ delay: 3000, callback: spawnPoisonArrow, callbackScope: this, loop: true });
    this.physics.add.overlap(player3, poisonarrows3, hitByPoisonArrow3, null, this);

    this.cameras.main.setBounds(0, 0, gameWidth3 + 100, gameHeight3 + 200);
    this.cameras.main.startFollow(player3, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(gameWidth3 / 2, gameHeight3 / 2);
}


function createPlatforms3(scene) {
    const platformLayout3 = [
        { x: 300, y: gameHeight3 - 60, width: 70 },  // 첫 번째 발판
        { x: 450, y: gameHeight3 - 130, width: 80 }, // 두 번째 발판
        { x: 600, y: gameHeight3 - 200, width: 60 }, // 세 번째 발판
        { x: 200, y: gameHeight3 - 270, width: 70 }, // 네 번째 발판
        { x: 350, y: gameHeight3 - 330, width: 60 }, // 다섯 번째 발판
        { x: 500, y: gameHeight3 - 400, width: 80 }, // 여섯 번째 발판
        { x: 650, y: gameHeight3 - 450, width: 70 }, // 일곱 번째 발판
        { x: 400, y: gameHeight3 - 520, width: 60 }, // 여덟 번째 발판
        { x: 300, y: gameHeight3 - 580, width: 70 }, // 아홉 번째 발판
    ];

    platforms3.clear(true, true);
    platformLayout3.forEach(platform => {
        const newPlatform3 = platforms3.create(platform.x, platform.y, 'ground');
        newPlatform3.setDisplaySize(platform.width, 24);
        newPlatform3.refreshBody();
    });

    platforms3.create(gameWidth3 / 2, gameHeight3 - 20, 'ground').setDisplaySize(gameWidth3, 32).refreshBody(); // 바닥 발판
}



function createCollectibles3(scene) {

     let gravityBox2_1 = scene.physics.add.group();
    gravityBox2_1.create(150, gameHeight3 - 120, 'Gdown').body.allowGravity = false; // 위치 조정
    scene.physics.add.overlap(player3, gravityBox2_1, changeGravityDown2, null, scene);

    let gravityBox2_2 = scene.physics.add.group();
    gravityBox2_2.create(200, gameHeight3 - 200, 'Gup').body.allowGravity = false; // 위치 조정
    scene.physics.add.overlap(player3, gravityBox2_2, changeGravityUp2, null, scene);
    
    let doublejumpbox3 = scene.physics.add.group();
    doublejumpbox3.create(700, gameHeight3 - 130, 'doubleup').body.allowGravity = false; // 위치 변경
    scene.physics.add.overlap(player3, doublejumpbox3, doubleJump3, null, scene);

    let coins3 = scene.physics.add.group();
    coins3.create(500, gameHeight3 - 450, 'coin').body.allowGravity = false; // 위치 변경
    scene.physics.add.overlap(player3, coins3, collectCoin3, null, scene);
}

// function createPortal3(scene) {
//     let portal3 = scene.physics.add.staticGroup();
//     portal3.create(750, gameHeight3 - 670, 'portal').body.allowGravity = false;

//     let isInteracting = false; // 포탈 상호작용 여부 체크

//     scene.physics.add.overlap(player3, portal3, function (player, portal) {
//         if (cursors3.up.isDown && !isInteracting) {
//             isInteracting = true; // 상호작용 시작
//             setTimeout(() => {
//                 endGame3();
//                 isInteracting = false; // 상호작용 종료
//             }, 1000); // 1초(1000ms) 딜레이 설정
//         }
//     });
// }

function createPortal3(scene) {
    let portal3 = scene.physics.add.staticGroup();
    portal3.create(750, gameHeight3 - 650, 'portal').body.allowGravity = false;
    let isInteracting = false;

    scene.physics.add.overlap(player3, portal3, function (player, portal) {
        let pointer = scene.input.activePointer; 
        if ((pointer.isDown && pointer.y < gameHeight3 / 2) || (cursors3.up.isDown && !isInteracting)) {
            isInteracting = true; 
            setTimeout(() => {
                endGame3();
                isInteracting = false; 
            }, 1000);
        }
    });
}





function createStar3(scene) {
    let starGroup3 = scene.physics.add.staticGroup();
    let starItem3 = starGroup3.create(60, gameHeight3 - 500, 'star');
    starItem3.setScale(0.1);
    starItem3.refreshBody();

    scene.physics.add.overlap(player3, starGroup3, collectStar3, null, scene);
}

function createJumpPlatforms3(scene) {
    let jumpPlatform = scene.physics.add.staticGroup();
    jumpPlatform.create(300, gameHeight3 - 150, 'jumpPlatform');
    jumpPlatform.create(700, gameHeight3 - 300, 'jumpPlatform');

    scene.physics.add.collider(player3, jumpPlatform, function (player, platform) {
        player.setVelocityY(-300); 
    });
}

function collectStar3(player, starItem3) {
    star3 += 1;
    
    starItem3.disableBody(true, true);  
    starText3.setText('Stars: ' + star3);
    console.log('Star collected! Total stars: ' + star3);
}

function collectCoin3(player, coin) {
    coin3 += 1;
    dropitem3 += 1; // dropitem을 올바르게 사용합니다.
    console.log('Coin collected! Total coins before disabling: ' + coin3);
    coin.disableBody(true, true);
    coinText3.setText('Coin: ' + coin3);
    console.log('Coin collected! Total coins: ' + coin3);
}



function changeGravityDown2(player, box) {
    this.physics.world.gravity.y -= 150;
    dropitem3 += 1;
    box.disableBody(true, true);
    console.log("Gravity decreased!");
}

function changeGravityUp2(player, box) {
    this.physics.world.gravity.y += 150;
    dropitem3 += 1;
    box.disableBody(true, true);
    console.log("Gravity increased!");
}


function doubleJump3(player, box) {
    hasDoubleJump3 = true;
    jumpcount3 = 0; 
    box.disableBody(true, true);
    console.log("Double jump acquired!");
}


function updateTime3() {
    time3 += 1;
    timerText3.setText('Time: ' + time3);
}

function spawnArrow3() {
    var side3 = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
    var yPos3 = Phaser.Math.Between(50, gameHeight3 - 50);
    var arrow3 = arrows3.create(side3 === -1 ? -50 : gameWidth3 + 50, yPos3, 'arrow');

    var angle3 = Phaser.Math.Angle.Between(arrow3.x, arrow3.y, player3.x, player3.y);
    arrow3.setRotation(angle3);

    this.physics.velocityFromRotation(angle3, 300, arrow3.body.velocity);

    arrow3.setCollideWorldBounds(true);
    arrow3.setBounce(1);
}

function hitByArrow3(player, arrow) {
    var knockbackDistance3 = 100;
    var knockbackAngle3 = Phaser.Math.Angle.Between(arrow.x, arrow.y, player.x, player.y);
    var knockbackX3 = Math.cos(knockbackAngle3) * knockbackDistance3;
    var knockbackY3 = Math.sin(knockbackAngle3) * knockbackDistance3;

    player.setVelocityX(-knockbackX3);
    player.setVelocityY(-knockbackY3);

    player.setTint(0xff0000);
    this.time.delayedCall(200, () => player.clearTint());

    arrow.destroy();
}

function spawnPoisonArrow() {
    var side3 = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
    var yPos3 = Phaser.Math.Between(50, gameHeight3 - 50);
    var poisonArrow3 = poisonarrows3.create(side3 === -1 ? -50 : gameWidth3 + 50, yPos3, 'poisonarrow');

    var angle3 = Phaser.Math.Angle.Between(poisonArrow3.x, poisonArrow3.y, player3.x, player3.y);
    poisonArrow3.setRotation(angle3);

    this.physics.velocityFromRotation(angle3, 300, poisonArrow3.body.velocity);

    poisonArrow3.setCollideWorldBounds(true);
    poisonArrow3.setBounce(1);
}

function hitByPoisonArrow3(player, poisonArrow3) {
    poisonArrow3.destroy();
    
    this.cameras.main.setZoom(1.2);  
    this.time.delayedCall(5000, function() {
        this.cameras.main.setZoom(1); 
    }, [], this);
}





function update3() {
    let pointer = this.input.activePointer;

    // 모바일 화면에서의 터치 좌표를 조정
    const touchX = pointer.x * (gameWidth3 / this.sys.game.config.width);
    const touchY = pointer.y * (gameHeight3 / this.sys.game.config.height);

    // 좌우 이동: 터치 입력 및 키보드 입력 처리
    if (pointer.isDown) {
        if (touchX < gameWidth3 / 2) {
            // 왼쪽 화면 터치 시 왼쪽으로 이동
            player3.setVelocityX(-160);
        } else {
            // 오른쪽 화면 터치 시 오른쪽으로 이동
            player3.setVelocityX(160);
        }
    } else if (cursors3.left.isDown) {
        player3.setVelocityX(-160);
    } else if (cursors3.right.isDown) {
        player3.setVelocityX(160);
    } else {
        player3.setVelocityX(0);
    }

    // 점프: 중앙 화면을 터치하거나 spacebar로 점프
    if ((pointer.isDown && touchY < gameHeight3 / 2 || cursors3.space.isDown) && player3.body.touching.down) {
        player3.setVelocityY(-200); // 첫 번째 점프
        jumpcount3 = 1; // 점프 카운트 초기화
    } else if (hasDoubleJump3 && jumpcount3 > 0 && (pointer.isDown && touchY < gameHeight3 / 2 || cursors3.space.isDown) && !player3.body.touching.down) {
        player3.setVelocityY(-200); // 더블 점프
        jumpcount3--; // 점프 카운트 감소
    }

    // 바닥에 닿으면 점프 카운트 리셋
    if (player3.body.touching.down) {
        jumpcount3 = 1; // 점프 카운트 리셋
    }

    // 카메라 스크롤
    if (player3.y < gameHeight3 / 2) {
        this.cameras.main.scrollY = player3.y - gameHeight3 / 2;
    }

    // UI 업데이트
    coinText3.setText('Coin: ' + coin3);
    timerText3.setText('Time: ' + time3);
}



// function update3() {
//     if (cursors3.left.isDown) {
//         player3.setVelocityX(-160);
//     } else if (cursors3.right.isDown) {
//         player3.setVelocityX(160);
//     } else {
//         player3.setVelocityX(0);
//     }

//     if (cursors3.space.isDown && player3.body.touching.down) {
//         player3.setVelocityY(-300);
//     } else if (cursors3.space.isDown && hasDoubleJump3) {
//         if (jumpcount3 === 1) {
//             player3.setVelocityY(-300);
//             jumpcount3++;
//         }
//     }

//     if (player3.body.touching.down) {
//         jumpcount3 = 1;
//     }
// }


// function update3() {
//     if (cursors3.left.isDown) {
//         player3.setVelocityX(-160);
//     } else if (cursors3.right.isDown) {
//         player3.setVelocityX(160);
//     } else {
//         player3.setVelocityX(0);
//     }

//     if (cursors3.space.isDown && player3.body.touching.down) {
//         player3.setVelocityY(-300);
//         jumpcount3 = 1; // 첫 번째 점프 후 카운트를 1로 설정
//     } else if (cursors3.space.isDown && hasDoubleJump3 && jumpcount3 === 1) {
//         player3.setVelocityY(-300);
//         jumpcount3++; // 두 번째 점프 후 카운트를 2로 설정
//     }

//     if (player3.body.touching.down) {
//         jumpcount3 = 1; // 땅에 닿았을 때 점프 카운트를 1로 리셋
//         hasDoubleJump3 = false; // 다시 더블 점프를 사용할 수 없도록 설정
//     }
// }



// function endGame3() {
//     function setCookie(name, value, days) {
//         var expires = "";
//         if (days) {
//             var date = new Date();
//             date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
//             expires = "; expires=" + date.toUTCString();
//         }
//         document.cookie = name + "=" + (value || "") + expires + "; path=/";
//     }

//     function getCookie(name) {
//         const value = ; ${document.cookie};
//         const parts = value.split(; ${name}=);
//         if (parts.length === 2) return parts.pop().split(';').shift();
//     }

//     var existingStage1Data = getCookie('stage1Data');
//     var existingStage2Data = getCookie('stage2Data');

//     var stage1Data = existingStage1Data ? JSON.parse(existingStage1Data) : {};
//     var stage2Data = existingStage2Data ? JSON.parse(existingStage2Data) : {};

//     // 현재 스테이지의 플레이 데이터
//     var gameData = {
//         uid: getCookie('uid'),
//         playTime: time3,
//         dropcoin: coin3,
//         dropstar: star3,
//         dropitem: dropitem3 // dropitem3 사용
//     };

//     // 1, 2, 3 스테이지 데이터 합산
//     var finalData = {  
//         uid: gameData.uid,
//         totalPlayTime: (stage1Data.totalPlayTime || 0) + (stage2Data.totalPlayTime || 0) + gameData.playTime,
//         totalDropcoin: (stage1Data.totalDropcoin || 0) + (stage2Data.totalDropcoin || 0) + gameData.dropcoin,
//         totalDropstar: (stage1Data.totalDropstar || 0) + (stage2Data.totalDropstar || 0) + gameData.dropstar,
//         totalDropitem: (stage1Data.totalDropitem || 0) + (stage2Data.totalDropitem || 0) + gameData.dropitem // dropitem으로 변경
//     };

//     // 서버로 데이터 전송
//     var xhr = new XMLHttpRequest();
//     xhr.open('POST', '/saveGameData', true);
//     xhr.setRequestHeader('Content-Type', 'application/json');
//     xhr.onreadystatechange = function () {
//         if (xhr.readyState == 4 && xhr.status == 200) {
//             console.log('서버 응답:', xhr.responseText);
//             // 랭킹 페이지로 이동
//             window.location.href = '/ranking';
//         } else if (xhr.readyState == 4) {
//             console.error('게임 데이터 전송 중 오류가 발생하였습니다. 응답:', xhr.responseText);
//         }
//     };

//     xhr.send(JSON.stringify(finalData));
// }


function endGame3() {
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
    const value = `; ${document.cookie}`;  // Correctly concatenate the string
    const parts = value.split(`; ${name}=`); // Use template literals for string interpolation
    if (parts.length === 2) return parts.pop().split(';').shift();
    }


    // 스테이지 데이터 가져오기
    var stage1Data = JSON.parse(getCookie('stage1Data') || '{}');
    var stage2Data = JSON.parse(getCookie('stage2Data') || '{}');

    // 현재 스테이지의 플레이 데이터
    var gameData = {
        uid: getCookie('uid'),
        playTime: time3,
        dropcoin: coin3,
        dropstar: star3,
        dropitem: dropitem3
    };

    // 1, 2, 3 스테이지 데이터 합산
    var finalData = {  
        uid: gameData.uid,
        totalPlayTime: (stage1Data.totalPlayTime || 0) + (stage2Data.totalPlayTime || 0) + gameData.playTime,
        totalDropcoin: (stage1Data.totalDropcoin || 0) + (stage2Data.totalDropcoin || 0) + gameData.dropcoin,
        totalDropstar: (stage1Data.totalDropstar || 0) + (stage2Data.totalDropstar || 0) + gameData.dropstar,
        totalDropitem: (stage1Data.totalDropitem || 0) + (stage2Data.totalDropitem || 0) + gameData.dropitem
    };

    // 서버로 데이터 전송
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/saveGameData', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                console.log('서버 응답:', xhr.responseText);
                // 랭킹 페이지로 이동
                window.location.href = '/ranking';
            } else {
                console.error('게임 데이터 전송 중 오류가 발생하였습니다. 응답:', xhr.responseText);
            }
        }
    };

    xhr.send(JSON.stringify(finalData));
}



