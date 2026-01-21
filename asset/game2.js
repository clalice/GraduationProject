var gameWidth2 = 900; 
var gameHeight2 = window.innerHeight;

var config2 = {
    type: Phaser.AUTO,
    width: gameWidth2,
    height: gameHeight2,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT, 
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 320 }, // 중력값 조정
            debug: false, 
        }
    },
    scene: {
        preload: preload2,
        create: create2,
        update: update2
    }
};

// config2를 사용하여 게임 인스턴스 생성
var game2 = new Phaser.Game(config2);

window.addEventListener('resize', () => {
    game.scale.resize(gameWidth, window.innerHeight * 0.85); 
});



var player2, platforms2, cursors2, timerText2, coinText2;
let coin2 = 0;
var jumpcount = 0;
var hasDoubleJump2 = false;
let time2 = 0;
var arrows, star2 = 0;
var spacebarEnabled = true;
let dropitem2 = 0;

function preload2() {
    this.load.image('sky', './sky.png');
    this.load.image('ground', './ground.png');
    this.load.image('dude', './player.png');
    this.load.image('doubleup', './double_pixel.png');
    this.load.image('Gdown', './gravity_down.png');
    this.load.image('Gup', './gravity_up.png');
    this.load.image('portal', './portal.png');
    this.load.image('coin', './coin.png');
    this.load.image('arrow', './arrow.png');
    this.load.image('star', './star.png');
}

function create2() {
    this.add.image(450, 300, 'sky');
    platforms2 = this.physics.add.staticGroup();
    createPlatforms2(this);

    player2 = this.physics.add.sprite(200, gameHeight2 - 50, 'dude');
    player2.setBounce(0.2).setCollideWorldBounds(true);
    this.physics.add.collider(player2, platforms2);

    cursors2 = this.input.keyboard.createCursorKeys();

    createCollectibles2(this);
    createPortal2(this);
    createstar2(this);

    coinText2 = this.add.text(16, 5, 'Coin: 0', { fontSize: '20px', fill: '#fff' });
    timerText2 = this.add.text(16, 30, 'Time: 0', { fontSize: '20px', fill: '#fff' });
    starText2 = this.add.text(16, 55, 'Stars: 0', { fontSize: '20px', fill: '#fff' });

    this.time.addEvent({ delay: 1000, callback: updateTime2, callbackScope: this, loop: true });

    arrows2 = this.physics.add.group();
    this.time.addEvent({ delay: 1500, callback: spawnArrow2, callbackScope: this, loop: true });
    this.physics.add.overlap(player2, arrows2, hitByArrow2, null, this);

    // 카메라 설정
    this.cameras.main.setBounds(0, 0, gameWidth2 + 100, gameHeight2 + 200);
    this.cameras.main.startFollow(player2, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(gameWidth2 / 2, gameHeight2 / 2); // 데드존 설정
}

function createPlatforms2(scene) {
    const platformLayout2 = [
        { x: 350, y: gameHeight2 - 60, width: 70 },  // 첫 번째 발판
        { x: 500, y: gameHeight2 - 110, width: 80 }, // 두 번째 발판
        { x: 650, y: gameHeight2 - 160, width: 60 }, // 세 번째 발판
        { x: 750, y: gameHeight2 - 210, width: 70 }, // 네 번째 발판
        { x: 550, y: gameHeight2 - 280, width: 60 }, // 다섯 번째 발판
        { x: 400, y: gameHeight2 - 340, width: 70 }, // 여섯 번째 발판
        { x: 300, y: gameHeight2 - 400, width: 80 }, // 일곱 번째 발판
        { x: 200, y: gameHeight2 - 470, width: 70 }, // 여덟 번째 발판
        { x: 400, y: gameHeight2 - 520, width: 60 }, // 아홉 번째 발판
        { x: 600, y: gameHeight2 - 570, width: 80 }, // 열 번째 발판
    ];

    platforms2.clear(true, true);
    platformLayout2.forEach(platform => {
        const newPlatform2 = platforms2.create(platform.x, platform.y, 'ground');
        newPlatform2.setDisplaySize(platform.width, 24);
        newPlatform2.refreshBody();
    });

    platforms2.create(gameWidth2 / 2, gameHeight2, 'ground').setDisplaySize(gameWidth2, 32).refreshBody(); // 바닥 발판
}


function createCollectibles2(scene) {
    let gravityBox2_1 = scene.physics.add.group();
    gravityBox2_1.create(150, gameHeight2 - 120, 'Gdown').body.allowGravity = false; // 위치 조정
    scene.physics.add.overlap(player2, gravityBox2_1, changeGravityDown2, null, scene);

    let gravityBox2_2 = scene.physics.add.group();
    gravityBox2_2.create(200, gameHeight2 - 600, 'Gup').body.allowGravity = false; // 위치 조정
    scene.physics.add.overlap(player2, gravityBox2_2, changeGravityUp2, null, scene);

    let doublejumpbox2 = scene.physics.add.group();
    doublejumpbox2.create(400, gameHeight2 - 400, 'doubleup').body.allowGravity = false; // 위치 조정
    scene.physics.add.overlap(player2, doublejumpbox2, doubleJump2, null, scene);

    let coins2 = scene.physics.add.group();
    coins2.create(450, gameHeight2 - 420, 'coin').body.allowGravity = false; // 위치 조정
    scene.physics.add.overlap(player2, coins2, collectCoin2, null, scene);
}

function createPortal2(scene) {
    let portal2 = scene.physics.add.staticGroup();
    portal2.create(650, gameHeight2 - 650, 'portal').body.allowGravity = false; 
    scene.physics.add.overlap(player2, portal2, function (player, portal) {
        let pointer = scene.input.activePointer;
        if (pointer.isDown && pointer.y < gameHeight2 / 2 || cursors2.up.isDown) {
            endGame2();
        }
    });
}



function createstar2(scene) {
    let starGroup2 = scene.physics.add.staticGroup();
    let starItem2 = starGroup2.create(60, gameHeight2 - 500, 'star');
    starItem2.setScale(0.1);
    starItem2.refreshBody();

    scene.physics.add.overlap(player2, starGroup2, collectStar2, null, scene);
}

function collectStar2(player, starItem2) {
    star2 += 1;
    starItem2.disableBody(true, true);  
    starText2.setText('Stars: ' + star2);
    console.log('Star collected! Total stars: ' + star2);
}

function collectCoin2(player, coin) {
    coin2 += 1;
    dropitem2 += 1;
    coin.disableBody(true, true);
    coinText2.setText('Coin: ' + coin2);
    console.log('Coin collected! Total coins: ' + coin2);
}

function changeGravityDown2(player, box) {
    this.physics.world.gravity.y -= 150;
    dropitem2 += 1;
    box.disableBody(true, true);
    console.log("Gravity decreased!");
}

function changeGravityUp2(player, box) {
    this.physics.world.gravity.y += 150;
    dropitem2 += 1;
    box.disableBody(true, true);
    console.log("Gravity increased!");
}

function doubleJump2(player, box) {
    hasDoubleJump2 = true;
    dropitem2 += 1;
    box.disableBody(true, true);
    console.log("Double jump acquired!");
}

function updateTime2() {
    time2 += 1;
    timerText2.setText('Time: ' + time2);
}

function spawnArrow2() {
    var side2 = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
    var yPos2 = Phaser.Math.Between(50, gameHeight2 - 50);
    var arrow2 = arrows2.create(side2 === -1 ? -50 : gameWidth2 + 50, yPos2, 'arrow');

    var angle2 = Phaser.Math.Angle.Between(arrow2.x, arrow2.y, player2.x, player2.y);
    arrow2.setRotation(angle2);

    this.physics.velocityFromRotation(angle2, 300, arrow2.body.velocity);

    arrow2.setCollideWorldBounds(true);
    arrow2.setBounce(1);
}

function hitByArrow2(player, arrow) {
    var knockbackDistance2 = 100;
    var knockbackAngle2 = Phaser.Math.Angle.Between(arrow.x, arrow.y, player.x, player.y);
    var knockbackX2 = Math.cos(knockbackAngle2) * knockbackDistance2;
    var knockbackY2 = Math.sin(knockbackAngle2) * knockbackDistance2;

    player.setVelocityX(-knockbackX2);
    player.setVelocityY(-knockbackY2);

    player.setTint(0xff0000);
    this.time.delayedCall(200, () => player.clearTint());

    arrow.destroy();
}

function update2() {
    let pointer = this.input.activePointer;

    // 모바일 화면에서의 터치 좌표를 조정
    const touchX = pointer.x * (gameWidth2 / this.sys.game.config.width);
    const touchY = pointer.y * (gameHeight2 / this.sys.game.config.height);

    // 좌우 이동: 터치 입력 및 키보드 입력 처리
    if (pointer.isDown) {
        if (touchX < gameWidth2 / 2) {
            // 왼쪽 화면 터치 시 왼쪽으로 이동
            player2.setVelocityX(-160);
        } else {
            // 오른쪽 화면 터치 시 오른쪽으로 이동
            player2.setVelocityX(160);
        }
    } else if (cursors2.left.isDown) {
        player2.setVelocityX(-160);
    } else if (cursors2.right.isDown) {
        player2.setVelocityX(160);
    } else {
        player2.setVelocityX(0);
    }

    // 점프: 중앙 화면을 터치하거나 spacebar로 점프
    if (pointer.isDown && touchY < gameHeight2 / 2 && jumpcount >= 1 && player2.body.touching.down && spacebarEnabled) {
        player2.setVelocityY(-200);
        jumpcount -= 1;
    } else if (cursors2.space.isDown && jumpcount >= 1 && player2.body.touching.down && spacebarEnabled) {
        player2.setVelocityY(-200);
        jumpcount -= 1;
    }

    // 더블 점프 기능 유지
    if (hasDoubleJump2) {
        jumpcount = 2;
        player2.body.touching.down = true;
        if ((pointer.isDown && touchY < gameHeight2 / 2 || cursors2.space.isDown) && player2.body.touching.down && jumpcount >= 1 && spacebarEnabled) {
            player2.setVelocityY(-200);
            spacebarEnabled = false;
            this.time.delayedCall(700, () => spacebarEnabled = true);
            player2.body.touching.down = false;
        }
    }

    if (player2.body.touching.down && jumpcount == 0) {
        jumpcount = 1;
    }

    // 카메라 스크롤
    if (player2.y < gameHeight2 / 2) {
        this.cameras.main.scrollY = player2.y - gameHeight2 / 2;
    }

    // UI 업데이트
    coinText2.setText('Coin: ' + coin2);
    timerText2.setText('Time: ' + time2);
}


// function update2() {
//     if (cursors2.left.isDown) {
//         player2.setVelocityX(-160);
//     } else if (cursors2.right.isDown) {
//         player2.setVelocityX(160);
//     } else {
//         player2.setVelocityX(0);
//     }

//     if (cursors2.space.isDown && player2.body.touching.down) {
//         player2.setVelocityY(-300);
//     } else if (cursors2.space.isDown && hasDoubleJump2) {
//         if (jumpcount2 === 1) {
//             player2.setVelocityY(-300);
//             jumpcount2++;
//         }
//     }

//     if (player2.body.touching.down) {
//         jumpcount2 = 1;
//     }

//     coinText2.setText('Coin: ' + coin2);
//     timerText2.setText('Time: ' + time2);
// }



// function update2() {
//     if (cursors2.left.isDown) {
//         player2.setVelocityX(-160);
//     } else if (cursors2.right.isDown) {
//         player2.setVelocityX(160);
//     } else {
//         player2.setVelocityX(0);
//     }

//     if (cursors2.space.isDown && player2.body.touching.down) {
//         player2.setVelocityY(-300);
//         jumpcount2 = 1; // 첫 점프 후 카운트를 1로 설정
//     } else if (cursors2.space.isDown && hasDoubleJump2 && jumpcount2 === 1) {
//         player2.setVelocityY(-300);
//         jumpcount2++; // 더블 점프 후 카운트를 2로 설정
//         hasDoubleJump2 = false; // 더블 점프 사용 후 false로 설정
//     }

//     if (player2.body.touching.down) {
//         jumpcount2 = 0; // 땅에 닿았을 때 점프 카운트 초기화
//         hasDoubleJump2 = false; // 더블 점프를 사용할 수 없도록 설정
//     }

//     coinText2.setText('Coin: ' + coin2);
//     timerText2.setText('Time: ' + time2);
// }

// function endGame2() {
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

//     var existingData = getCookie('stage1Data');
//     var stage1Data = existingData ? JSON.parse(existingData) : {};

//     var gameData = {
//         uid: getCookie('uid'),
//         playTime: time2,
//         dropcoin: coin2,
//         dropstar: star2,
//         dropitem: 0
//     };

//     var finalData = {
//         uid: gameData.uid,
//         totalPlayTime: (stage1Data.playTime || 0) + gameData.playTime,
//         totalDropcoin: (stage1Data.dropcoin || 0) + gameData.dropcoin,
//         totalDropstar: (stage1Data.dropstar || 0) + gameData.dropstar,
//         totalDropitem: (stage1Data.dropitem || 0) + gameData.dropitem2
//     };

//     // 쿠키에 합산된 데이터 저장
//     setCookie('stage1Data', JSON.stringify(finalData), 1);

//     // 3스테이지로 이동
//     window.location.href = '/phasergame3';
// }


function endGame2() {
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


    var existingData = getCookie('stage1Data');
    var stage1Data = existingData ? JSON.parse(existingData) : {};

    var gameData = {
        uid: getCookie('uid'),
        playTime: time2,
        dropcoin: coin2,
        dropstar: star2,
        dropitem: dropitem2 // 수정된 부분: dropitem2를 사용합니다.
    };

    var stage2Data = {
        uid: gameData.uid,
        totalPlayTime: (stage1Data.playTime || 0) + gameData.playTime,
        totalDropcoin: (stage1Data.dropcoin || 0) + gameData.dropcoin,
        totalDropstar: (stage1Data.dropstar || 0) + gameData.dropstar,
        totalDropitem: (stage1Data.dropitem || 0) + gameData.dropitem // 수정된 부분: dropitem으로 변경했습니다.
    };

    // 쿠키에 합산된 데이터 저장
    setCookie('stage1Data', JSON.stringify(stage2Data), 1);

    // 3스테이지로 이동
    window.location.href = '/phasergame3';
}
