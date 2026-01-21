
var gameWidth = 900; 
var gameHeight = window.innerHeight;

var config = {
    type: Phaser.AUTO,
    width: gameWidth,
    height: gameHeight,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT, 
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 360 }, 
            debug: false, 
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

window.addEventListener('resize', () => {
    game.scale.resize(gameWidth, window.innerHeight * 0.85); 
});

var player, platforms, cursors, timerText, coinText;
var coin = 0;
var arrows;
var jumpcount = 1;
var hasDoubleJump = false;
var spacebarEnabled = true;
let time = 0;
let star = 0; 
let dropitem = 0;

function logToConsole(message) {
    const consoleOutput = document.getElementById('console-output');
    const newMessage = document.createElement('div');
    newMessage.textContent = message;
    consoleOutput.appendChild(newMessage);
}

function preload() {
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

function create() {
    this.add.image(450, 300, 'sky');
    platforms = this.physics.add.staticGroup();
    createPlatforms(this);

    player = this.physics.add.sprite(200, gameHeight - 100, 'dude'); // 플레이어의 위치를 높이 조정
    player.setBounce(0.2).setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    createCollectibles(this);
    createPortal(this);
    createstar(this); 

    coinText = this.add.text(16, 5, 'Coin: 0', { fontSize: '20px', fill: '#fff' });
    timerText = this.add.text(16, 16, 'Time: 0', { fontSize: '20px', fill: '#fff' });
    starText = this.add.text(16, 30, 'Stars: 0', { fontSize: '20px', fill: '#fff' });

    this.time.addEvent({ delay: 1000, callback: updateTime, callbackScope: this, loop: true });

    arrows = this.physics.add.group();
    this.time.addEvent({ delay: 2000, callback: spawnArrow, callbackScope: this, loop: true });
    this.physics.add.overlap(player, arrows, hitByArrow, null, this);
}

// 플랫폼 생성 함수
function createPlatforms(scene) {
    const platformLayout = [
        { x: 400, y: gameHeight - 50, width: 150 },
        { x: 550, y: gameHeight - 100, width: 120 },
        { x: 700, y: gameHeight - 150, width: 150 },
        { x: 900, y: gameHeight - 200, width: 120 },
        { x: 700, y: gameHeight - 250, width: 150 },
        { x: 550, y: gameHeight - 300, width: 120 },
        { x: 400, y: gameHeight - 350, width: 150 },
        { x: 250, y: gameHeight - 400, width: 180 },
        { x: 50, y: gameHeight - 450, width: 120 },
        { x: 250, y: gameHeight - 500, width: 150 },
        { x: 400, y: gameHeight - 550, width: 180 },
        { x: 550, y: gameHeight - 600, width: 150 },
        { x: 700, y: gameHeight - 650, width: 180 }
    ];

    platforms.clear(true, true);

    platformLayout.forEach(platform => {
        const newPlatform = platforms.create(platform.x, platform.y, 'ground');
        newPlatform.setDisplaySize(platform.width, 24);
        newPlatform.refreshBody();
    });

    platforms.create(gameWidth / 2, gameHeight, 'ground').setDisplaySize(gameWidth, 32).refreshBody();
}

function createCollectibles(scene) {
    let gravityBox1 = scene.physics.add.group();
    gravityBox1.create(550, gameHeight - 150, 'Gdown').body.allowGravity = false;
    scene.physics.add.overlap(player, gravityBox1, changeGravityDown, null, scene);

    let gravityBox2 = scene.physics.add.group();
    gravityBox2.create(250, gameHeight - 450, 'Gup').body.allowGravity = false;
    scene.physics.add.overlap(player, gravityBox2, changeGravityUp, null, scene);

    let doublejumpbox = scene.physics.add.group();
    doublejumpbox.create(650, gameHeight - 450, 'doubleup').body.allowGravity = false;
    scene.physics.add.overlap(player, doublejumpbox, doubleJump, null, scene);

    let coins = scene.physics.add.group();
    coins.create(250, gameHeight - 600, 'coin').body.allowGravity = false;
    scene.physics.add.overlap(player, coins, collectCoin, null, scene);
}




//기존 포탈 생성
// function createPortal(scene) {
//     let portal = scene.physics.add.staticGroup();
//     portal.create(750, gameHeight - 695, 'portal').body.allowGravity = false;
//     scene.physics.add.overlap(player, portal, function (player, portal) {
//         if (cursors.up.isDown) {
//             endGame();
//         }
//     });
// }

function createPortal(scene) {
    let portal = scene.physics.add.staticGroup();
    portal.create(750, gameHeight - 695, 'portal').body.allowGravity = false;
    scene.physics.add.overlap(player, portal, function (player, portal) {
        let pointer = scene.input.activePointer;
        if (pointer.isDown && pointer.y < gameHeight / 2 || cursors.up.isDown) {
            endGame();
        }
    });
}


function createstar(scene) {
    let starGroup = scene.physics.add.staticGroup();
    let starItem = starGroup.create(60, gameHeight - 500, 'star');
    starItem.setScale(0.1); 
    starItem.refreshBody(); 

    scene.physics.add.overlap(player, starGroup, collectStar, null, scene);
}

function collectStar(player, starItem) {
    try {
        star += 1; // 스타 증가
        dropitem += 1; // 드랍 아이템 증가 (스타에 대한 드랍 아이템 수 증가)
        starItem.disableBody(true, true);
        starText.setText('Stars: ' + star);
        console.log('Star collected! Total stars: ' + star);
    } catch (error) {
        console.error('Error in collectStar:', error);
    }
}


function changeGravityDown(player, box) {
    this.physics.world.gravity.y -= 150;
    dropitem += 1;
    box.disableBody(true, true);
    logToConsole("중력 감소!");
}

function changeGravityUp(player, box) {
    this.physics.world.gravity.y += 150;
    dropitem += 1;
    box.disableBody(true, true);
    logToConsole("중력 증가!");
}

function doubleJump(player, box) {
    hasDoubleJump = true;
    dropitem += 1;
    box.disableBody(true, true);
    logToConsole("더블 점프 획득!");
}

function collectCoin(player, box) {
    coin += 1;
    box.disableBody(true, true);
    coinText.setText('Coin: ' + coin);
    logToConsole("코인 획득!");
}

function updateTime() {
    time += 1;
    timerText.setText('Time: ' + time);
}
function spawnArrow() {
    // 랜덤한 위치와 방향으로 화살을 생성합니다.
    var side = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // 왼쪽 또는 오른쪽
    var yPos = Phaser.Math.Between(50, gameHeight - 50);
    var arrow = arrows.create(side === -1 ? -50 : gameWidth + 50, yPos, 'arrow');
    
    // 화살의 방향과 속도를 설정합니다.
    var angle = Phaser.Math.Angle.Between(arrow.x, arrow.y, player.x, player.y);
    arrow.setRotation(angle);
    
    // 화살의 속도를 설정합니다.
    this.physics.velocityFromRotation(angle, 300, arrow.body.velocity);

    // 화살의 범위를 벗어나면 삭제되도록 합니다.
    arrow.setCollideWorldBounds(true);
    arrow.setBounce(1);
}

function hitByArrow(player, arrow) {
    // 넉백 강도를 설정합니다.
    var knockbackDistance = 100;
    var knockbackAngle = Phaser.Math.Angle.Between(arrow.x, arrow.y, player.x, player.y);
    var knockbackX = Math.cos(knockbackAngle) * knockbackDistance;
    var knockbackY = Math.sin(knockbackAngle) * knockbackDistance;
    
    // 넉백 효과를 적용합니다.
    player.setVelocityX(-knockbackX);
    player.setVelocityY(-knockbackY);

    // 플레이어에게 깜빡임 효과를 추가합니다.
    player.setTint(0xff0000);
    this.time.delayedCall(200, () => player.clearTint());

    // 화살을 삭제합니다.
    arrow.destroy();
}


function endGame() {
    // 쿠키 설정 함수 (days는 숫자)
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 )); // 밀리초 단위로 수정
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    // 쿠키 가져오기 함수
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // 쿠키가 없으면 null 반환
    }

    var existingData = getCookie('stage1Data');
    var stage1Data = existingData ? JSON.parse(existingData) : {};

    // 현재 스테이지에서의 게임 데이터 기록
    var gameData = {
        uid: getCookie('uid') || '', // uid가 없으면 빈 문자열
        playTime: time,  // 현재 스테이지에서의 플레이 시간
        dropcoin: coin,
        dropstar: star,
        dropitem: dropitem
    };

    // 새로운 데이터를 업데이트
    var stage1Data = {
        uid: gameData.uid,
        playTime: gameData.playTime,  // 현재 스테이지 플레이 시간
        dropcoin: (stage1Data.dropcoin || 0) + gameData.dropcoin, // 누적 코인
        dropstar: (stage1Data.dropstar || 0) + gameData.dropstar, // 누적 스타
        dropitem: (stage1Data.dropitem || 0) + gameData.dropitem  // 누적 드랍 아이템
    };

    // 쿠키에 데이터 저장
    setCookie('stage1Data', JSON.stringify(stage1Data), 1);

    // 2스테이지로 이동
    window.location.href = '/phasergame2';
}



// 기존 pc버전만 가능한 이동 업데이트코드
// function update() {
//     if (cursors.left.isDown) {
//         player.setVelocityX(-160);
//     } else if (cursors.right.isDown) {
//         player.setVelocityX(160);
//     } else {
//         player.setVelocityX(0);
//     }

//     if (cursors.space.isDown && (jumpcount >= 1) && player.body.touching.down && spacebarEnabled) {
//         player.setVelocityY(-200);
//         jumpcount -= 1;
//     }

//     if (hasDoubleJump) {
//         jumpcount = 2;
//         player.body.touching.down = true;
//         if (cursors.space.isDown && player.body.touching.down && (jumpcount >= 1) && spacebarEnabled) {
//             player.setVelocityY(-200);
//             spacebarEnabled = false;
//             this.time.delayedCall(700, () => spacebarEnabled = true);
//             player.body.touching.down = false;
//         }
//     }

//     if (player.body.touching.down && jumpcount == 0) {
//         jumpcount = 1;
//     }

//     if (player.y < gameHeight / 2) {
//         this.cameras.main.scrollY = player.y - gameHeight / 2;
//     }

//     coinText.setText('Coin: ' + coin);
//     timerText.setText('Time: ' + time);
// }


function update() {
    let pointer = this.input.activePointer;

    // 모바일 화면에서의 터치 좌표를 조정
    const touchX = pointer.x * (gameWidth / this.sys.game.config.width);
    const touchY = pointer.y * (gameHeight / this.sys.game.config.height);

    // 좌우 이동: 터치 입력 및 키보드 입력 처리
    if (pointer.isDown) {
        if (touchX < gameWidth / 2) {
            // 왼쪽 화면 터치 시 왼쪽으로 이동
            player.setVelocityX(-160);
        } else {
            // 오른쪽 화면 터치 시 오른쪽으로 이동
            player.setVelocityX(160);
        }
    } else if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }

    // 점프: 중앙 화면을 터치하거나 spacebar로 점프
    if (pointer.isDown && touchY < gameHeight / 2 && jumpcount >= 1 && player.body.touching.down && spacebarEnabled) {
        player.setVelocityY(-200);
        jumpcount -= 1;
    } else if (cursors.space.isDown && jumpcount >= 1 && player.body.touching.down && spacebarEnabled) {
        player.setVelocityY(-200);
        jumpcount -= 1;
    }

    // 더블 점프 기능 유지
    if (hasDoubleJump) {
        jumpcount = 2;
        player.body.touching.down = true;
        if ((pointer.isDown && touchY < gameHeight / 2 || cursors.space.isDown) && player.body.touching.down && jumpcount >= 1 && spacebarEnabled) {
            player.setVelocityY(-200);
            spacebarEnabled = false;
            this.time.delayedCall(700, () => spacebarEnabled = true);
            player.body.touching.down = false;
        }
    }

    if (player.body.touching.down && jumpcount == 0) {
        jumpcount = 1;
    }

    // 카메라 스크롤
    if (player.y < gameHeight / 2) {
        this.cameras.main.scrollY = player.y - gameHeight / 2;
    }

    // UI 업데이트
    coinText.setText('Coin: ' + coin);
    timerText.setText('Time: ' + time);
}


