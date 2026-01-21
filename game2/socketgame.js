class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene'
        });
        this.players = {};
        this.socket = null;
        this.hint = '';
        this.puzzleSolved = false;
        this.hint2 = ''; // 초기 힌트 상태
        this.puzzleSolved2 = false; // 퍼즐 해결 여부 초기화
        this.playerRole = '';
        this.playTime = 0;
        this.timerText = null;
        this.portalInteractionComplete = false;

        this.switches = []; // 스위치 오브젝트 배열
        this.currentSwitchIndex = 0; // 현재 활성화해야 할 스위치 인덱스
        this.requiredSwitchOrder = [3, 2, 1, 0]; // 스위치 순서 (인덱스)
        this.switchInteractionDelay = false; // 스위치 상호작용 딜레이 초기화
        this.switchHintGiven = false;

        this.maxstack = 6;
        this.puzzleStack = 0; // 퍼즐 해결 스택 초기화
    }


    preload() {
        this.load.image('player1', './player1.png');
        this.load.image('dungeon', './dungeon.png');
        this.load.image('player2', './player2.png');
        this.load.image('Hint', './Hint.png');
        this.load.image('puzzle', './puzzle.png');
        this.load.image('switch_up', './switch_up.png');
        this.load.image('downlever', './downlever.png');
        this.load.image('walls', './walls.png');
        this.load.image('portal', './portal.png');
        this.load.image('handlingbox', './handlingbox.png');
        this.load.image('SecondPuzzle', './puzzle.png'); // 두 번째 퍼즐 이미지
        this.load.image('Hint2', './Hint.png'); // 두 번째 힌트 아이템 이미지


    }







    // create() {
    //         //this.add.image(600, 400, 'dungeon').setOrigin(0.5, 0.5).setDisplaySize(1250, 800); 
    //         const width = this.scale.width;
    //         const height = this.scale.height;

    //         this.add.image(width / 2, height / 2, 'dungeon')
    //             .setOrigin(0.5, 0.5)  
    //             .setDisplaySize(width, height);  


    //         this.cursors = this.input.keyboard.createCursorKeys();
    //         this.setupSocket();
    //         this.createWalls();
    //         this.createPuzzleItem();
    //         this.createInputPuzzleItem();
    //         this.switchStates = Array(this.switches.length).fill(false); // 스위치 초기 상태 (up)
    //         this.createSwitchItems(); 
    //         this.createHintText();
    //         this.setupChatInput();
    //         this.timerText = this.add.text(10, 50, 'Time: 0', { fontSize: '14px', fill: '#fff' });

    //         this.time.addEvent({
    //             delay: 1000,
    //             callback: this.updatePlayTime,
    //             callbackScope: this,
    //             loop: true
    //         });

    //     }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.add.image(width / 2, height / 2, 'dungeon')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(width, height);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.setupSocket();
        //this.createWalls();

        this.createPuzzleItems();
        this.switchStates = Array(this.switches.length).fill(false); // 스위치 초기 상태 (up)
        this.createSwitchItems();
        this.setupChatInput();

        this.createSwitchHintItem();
        this.createSwitchHintText();

        // 타이머 텍스트 추가
        this.timerText = this.add.text(10, 50, 'Time: 0', {
            fontSize: '14px',
            fill: '#fff'
        });

        // 타이머 업데이트 이벤트 설정
        this.time.addEvent({
            delay: 1000,
            callback: this.updatePlayTime,
            callbackScope: this,
            loop: true
        });
    }




    createPuzzleItems() {
        console.log('Creating puzzle items...');
        this.createPuzzleItem(); // 첫 번째 퍼즐 아이템 생성
        this.createInputPuzzleItem(); // 입력 퍼즐 아이템 생성
        this.createPuzzleItem2(); // 두 번째 퍼즐 아이템 생성
        this.createInputPuzzleItem2(); // 두 번째 입력 퍼즐 아이템 생성
        this.createHintText(); // 첫 번째 힌트 텍스트
        this.createHintText2(); // 두 번째 힌트 텍스트
        console.log('Puzzle items created.');
    }


    updatePlayTime() {
        this.playTime += 1;
        this.timerText.setText('Time: ' + this.playTime);
    }


    //소켓 세팅
    setupSocket() {
        this.socket = new WebSocket('wss://port-0-graduationproject-m20brdfb5c7915fd.sel4.cloudtype.app/secondgame');

        this.socket.onopen = () => {
            console.log('WebSocket connection opened');
            this.socket.send(JSON.stringify({
                type: 'join'
            }));
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error: ', error);
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket connection closed: ', event);
        };

        // this.socket.onmessage = (event) => this.handleSocketMessage(JSON.parse(event.data));
        this.socket.onmessage = (event) => {
            //console.log('Message from server: ', event.data);
            this.handleSocketMessage(JSON.parse(event.data));
        };


    }


    handleSocketMessage(data) {
        switch (data.type) {
            case 'playerId':
                this.initializePlayer(data.playerId);
                this.playerRole = data.role;
                console.log('Your role is: ${this.playerRole}');
                this.displayRole();
                break;
            case 'players':
                this.updatePlayers(data.players);
                break;
            case 'hint':
                this.receiveHint(data.hint);
                break;
            case 'puzzleSolved':
                this.handlePuzzleSolved(data.portalPosition);
                break;

            case 'chat':
                this.handleChatMessage(data);
                break;
            default:
                break;
        }
    }


    displayRole() {
        const roleText = this.add.text(10, 30, `Role: ${this.playerRole}`, {
            fontSize: '16px',
            fill: '#fff'
        });
        roleText.setScrollFactor(0);
    }

    updatePlayers(playerDataArray) {
        playerDataArray.forEach((playerData) => {
            if (!this.players[playerData.id]) {
                const player = this.physics.add.sprite(playerData.x, playerData.y, 'player2');
                player.setCollideWorldBounds(true);
                this.players[playerData.id] = player;
                this.players[playerData.id].role = playerData.role;
                this.physics.add.collider(player, this.walls);
            } else {
                this.players[playerData.id].setPosition(playerData.x, playerData.y);
            }
        });
    }


    createWalls() {
        this.walls = this.physics.add.staticGroup();
        const wallThickness = 10;
        const centerX = this.scale.width / 2.1;

        const wall = this.walls.create(centerX, 0, 'walls')
            .setOrigin(0.5, 0)
            .setDisplaySize(wallThickness, this.scale.height);
        wall.refreshBody();

        for (const playerId in this.players) {
            const player = this.players[playerId];
            this.physics.add.collider(player, this.walls);
        }
    }


    initializePlayer(playerId) {
        this.playerId = playerId;
        const player = this.physics.add.sprite(300, 300, 'player1');
        player.setCollideWorldBounds(true);
        this.players[this.playerId] = player;

        this.switches.forEach(switchItem => {
            this.physics.add.overlap(player, switchItem, () => this.handlePlayerSwitchInteraction(this.switches.indexOf(switchItem)), null, this);
        });
    }

    interactWithPuzzle(player, puzzle) {
        if (!player || !puzzle || this.puzzleSolved || this.switchInteractionDelay) return;

        if (Phaser.Math.Distance.Between(player.x, player.y, puzzle.x, puzzle.y) < 50) {
            addToConsole("Press UP to interact with the puzzle.");

            const upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
            upKey.once('down', () => {
                if (this.physics.overlap(player, puzzle)) {
                    addToConsole("Interacting with the puzzle...");
                    this.puzzleSolved = true;
                    this.startPuzzleInteractionDelay();
                }
            });
        }
    }

    startSwitchInteractionDelay(index) {
        this.switchInteractionDelay = true; // 딜레이 시작
        this.time.delayedCall(8000, () => {
            this.switchInteractionDelay = false; // 딜레이 해제
            addToConsole(`Switch ${index} is ready for next interaction.`); 
        });
    }

    handlePlayerSwitchInteraction(index) {
        // 현재 스위치가 올바른 인덱스인지 확인
        if (index === this.requiredSwitchOrder[this.currentSwitchIndex]) {
            if (!this.switchStates[index]) { // 스위치가 아직 활성화되지 않았다면
                this.switchStates[index] = true; // 스위치 상태 변경
                this.switches[index].setTexture('downlever'); // 스위치 이미지 변경
                addToConsole(`Switch ${index} activated!`); // 수정된 부분
                this.puzzleStack++; // 퍼즐 해결 스택 증가
                this.currentSwitchIndex++; // 다음 스위치로 이동

                if (this.puzzleStack >= this.maxstack) {
                    addToConsole("All switches activated! Creating portal...");
                    this.createPortal(150, 250);
                } else {
                    addToConsole(`Puzzle stack increased to ${this.puzzleStack}.`);
                }

                this.startSwitchInteractionDelay(index);
            }
        } else {
            // 잘못된 스위치 활성화 처리
            if (this.switchInteractionDelay) {
                return;
            }

            addToConsole(`Incorrect switch! Expected ${this.requiredSwitchOrder[this.currentSwitchIndex]}, but got ${index}.`);
            this.resetSwitches();
        }
    }



    // 모든 스위치 상태 초기화하는 메서드
    resetSwitches() {
        let resetOccurred = false;
        this.switchStates.forEach((state, index) => {
            if (state) {
                this.switchStates[index] = false;
                this.switches[index].setTexture('switch_up');
                resetOccurred = true;
            }
        });

        if (resetOccurred) {
            addToConsole("Switches have been reset."); // 문자열을 올바르게 감싸줌
        }

        this.puzzleStack = 0;
        this.currentSwitchIndex = 0;
    }

    destroy() {
        clearInterval(this.resetInterval);
        super.destroy();
    }

    // createSwitchItems() {
    //     const switchPositions = [{
    //             x: 150,
    //             y: 300
    //         },
    //         {
    //             x: 200,
    //             y: 300
    //         },
    //         {
    //             x: 250,
    //             y: 300
    //         },
    //         {
    //             x: 300,
    //             y: 300
    //         },
    //     ];

    //     switchPositions.forEach((pos, index) => {
    //         const switchItem = this.physics.add.sprite(pos.x, pos.y, 'switch_up');
    //         this.switches.push(switchItem);

    //         // 충돌 처리는 플레이어가 생성된 후에 등록해야 함
    //         this.time.delayedCall(500, () => {
    //             this.physics.add.overlap(this.players[this.playerId], switchItem, () => {
    //                 this.handlePlayerSwitchInteraction(index);
    //             }, null, this);
    //         });
    //     });
    // }

    createSwitchItems() {
    const switchPositions = [{
            x: this.scale.width * 0.15, // 15% 위치
            y: this.scale.height * 0.75 // 75% 위치
        },
        {
            x: this.scale.width * 0.25, // 25% 위치
            y: this.scale.height * 0.75 // 75% 위치
        },
        {
            x: this.scale.width * 0.35, // 35% 위치
            y: this.scale.height * 0.75 // 75% 위치
        },
        {
            x: this.scale.width * 0.45, // 45% 위치
            y: this.scale.height * 0.75 // 75% 위치
        },
    ];

    switchPositions.forEach((pos, index) => {
        const switchItem = this.physics.add.sprite(pos.x, pos.y, 'switch_up');
        this.switches.push(switchItem);

        // 충돌 처리는 플레이어가 생성된 후에 등록해야 함
        this.time.delayedCall(500, () => {
            this.physics.add.overlap(this.players[this.playerId], switchItem, () => {
                this.handlePlayerSwitchInteraction(index);
            }, null, this);
        });
    });
}




    resetPuzzleStack() {
        this.puzzleStack = 0; // 스택 초기화
        this.currentSwitchIndex = 0; // 인덱스 초기화
        addToConsole("Puzzle stack reset.");
    }






    createPuzzleItem() {
        const puzzleX = this.scale.width * 0.4; // 전체 너비의 80%
        const puzzleY = this.scale.height * 0.3; // 전체 높이의 30%

        this.puzzleItem = this.physics.add.sprite(puzzleX, puzzleY, 'Hint');
        this.puzzleItem.setCollideWorldBounds(true);
    }

    createInputPuzzleItem() {
      this.inputPuzzleItem = this.physics.add.sprite(this.scale.width * 0.7, this.scale.height * 0.1, 'puzzle');
        this.inputPuzzleItem.setCollideWorldBounds(true);
        this.physics.add.collider(this.inputPuzzleItem, this.walls);

        console.log('inputPuzzleItem created:', this.inputPuzzleItem); 
    }




    createHintText() {
        this.hintText = this.add.text(10, 10, '', {
            fontSize: '14px',
            fill: '#fff'
        });
    }

receiveHint(hint) {
    addToConsole(`Hint received: ${hint}`);
    this.hint = hint;
    this.hintText.setText(hint);
}


    promptForSolution() {
        const userInput = prompt("힌트: 나는 항상 너의 곁에 있지만, 너는 나를 보지 못해. 정답은? :");
        if (userInput) {
            this.checkPuzzleSolution(userInput);
        }
    }
    checkPuzzleSolution(input) {
        const correctSolution = '공기';

        if (input === correctSolution) {
            addToConsole("Puzzle Solved! Correct password.");
            this.puzzleSolved = true;
            this.inputPuzzleItem.destroy();
            this.puzzleStack++
            this.socket.send(JSON.stringify({
                type: 'puzzleSolved',
                hint: this.hint
            }));
            if (this.puzzleStack >= this.maxstack) {
                addToConsole("All switches activated! Creating portal...");
                this.createPortal(150, 250);
            }
        } else {
            addToConsole("Incorrect password. Try again.");
        }
    }

    checkProximityForHint(player) {
    if (Phaser.Math.Distance.Between(player.x, player.y, this.puzzleItem.x, this.puzzleItem.y) < 50 && this.hint === '' && !this.puzzleSolved) {
        this.hint = '힌트: "나는 항상 너의 곁에 있지만, 너는 나를 보지 못해."';
        this.hintText.setText(this.hint);
        addToConsole(`Hint provided: ${this.hint}`); // 수정된 부분
        this.puzzleItem.destroy();
        this.socket.send(JSON.stringify({
            type: 'hint',
            hint: this.hint
        }));
    }
}


    checkProximityForPuzzleSolve(player) {
        if (Phaser.Math.Distance.Between(player.x, player.y, this.inputPuzzleItem.x, this.inputPuzzleItem.y) < 50 && !this.puzzleSolved) {
            this.promptForSolution();
        }
    }

    /////////////////////////////////////    /////////////////////////////////////    /////////////////////////////////////
    createPuzzleItem2() {
        const puzzleX2 = this.scale.width * 0.25; // 퍼즐 아이템 X 좌표
        const puzzleY2 = this.scale.height / 2; // 퍼즐 아이템 Y 좌표
        this.puzzleItem2 = this.physics.add.sprite(puzzleX2, puzzleY2, 'Hint2');
        this.puzzleItem2.setCollideWorldBounds(true);
    }

    createHintText2() {
        const hintY2 = this.scale.height / 2 + 30;
        this.hintText2 = this.add.text(10, hintY2, '', {
            fontSize: '14px',
            fill: '#fff'
        });
    }
    createInputPuzzleItem2() {
     this.inputPuzzleItem2 = this.physics.add.sprite(this.scale.width * 0.8, this.scale.height * 0.3, 'puzzle');

        this.inputPuzzleItem2.setCollideWorldBounds(true);
        this.physics.add.collider(this.inputPuzzleItem2, this.walls);
    }

    receiveHint2(hint) {
        addToConsole(`Hint received: ${hint}`);
        this.hint2 = hint;
        this.hintText2.setText(hint);
    }

    promptForSolution2() {
        const userInput2 = prompt(" 나는 투명하고 너를 적시지만, 잡을 수 없다. 정답은? :");
        if (userInput2) {
            this.checkPuzzleSolution2(userInput2);
        }
    }

    checkPuzzleSolution2(input) {
        const correctSolution2 = '물';

        if (input === correctSolution2) {
            addToConsole("Puzzle 2 Solved! Correct password.");
            this.puzzleSolved2 = true;
            this.inputPuzzleItem2.destroy();
            this.puzzleStack++;
            this.socket.send(JSON.stringify({
                type: 'puzzleSolved',
                hint: this.hint2
            }));
            if (this.puzzleStack >= this.maxstack) {
                addToConsole("All switches for puzzle 2 activated! Creating portal 2...");
                this.createPortal(200, 300); // 새로운 위치의 포탈
            }
        } else {
            addToConsole("Incorrect password for puzzle 2. Try again.");
        }
    }

    checkProximityForHint2(player) {
        if (this.puzzleItem2) { // 퍼즐 아이템이 존재하는지 확인
            const distance = Phaser.Math.Distance.Between(player.x, player.y, this.puzzleItem2.x, this.puzzleItem2.y);
            if (distance < 50 && this.hint2 === '' && !this.puzzleSolved2) {
                this.hint2 = '힌트: "나는 투명하고 너를 적시지만, 잡을 수 없다."';
                this.hintText2.setText(this.hint2);
                addToConsole(`Hint 2 provided: ${this.hint2}`);
                this.puzzleItem2.destroy(); 
                this.socket.send(JSON.stringify({
                    type: 'hint2',
                    hint: this.hint2
                }));
            }
        }
    }


    checkProximityForPuzzleSolve2(player) {
        if (Phaser.Math.Distance.Between(player.x, player.y, this.inputPuzzleItem2.x, this.inputPuzzleItem2.y) < 50 && !this.puzzleSolved2) {
            this.promptForSolution2();
        }
    }



    createSwitchHintItem() {
        // const hintX = 300; // X 좌표
        // const hintY = this.scale.height / 2; // Y 좌표

        const hintX = this.scale.width * 0.375; // 전체 너비의 37.5%
const hintY = this.scale.height * 0.5; // 전체 높이의 50%

        this.switchHintItem = this.physics.add.sprite(hintX, hintY, 'Hint'); // 스위치 힌트 스프라이트
        this.switchHintItem.setCollideWorldBounds(true);
    }
    createSwitchHintText() {
        this.switchHintText = this.add.text(10, 50, '', {
            fontSize: '14px',
            fill: '#fff'
        });
    }
    checkProximityForSwitchHint(player) {
        if (this.switchHintItem) {
            const distance = Phaser.Math.Distance.Between(player.x, player.y, this.switchHintItem.x, this.switchHintItem.y);
            if (distance < 50 && !this.switchHintGiven) {
                this.switchHintGiven = true; // 힌트가 제공되었음을 표시
                const switchHint = '힌트: "마치 사다리를 올라가는 것처럼, 아래에서부터 시작하라."';
                this.switchHintText.setText(switchHint);
                addToConsole(`Switch Hint provided: ${switchHint}`);
                this.switchHintItem.destroy(); // 힌트를 제공한 후 힌트 아이템 제거
                this.socket.send(JSON.stringify({
                    type: 'switchHint',
                    hint: switchHint
                }));
            }
        }
    }

    ///////////////////////////    /////////////////////////////////////    /////////////////////////////////////



    setupChatInput() {
        const chatInput = document.getElementById('chat-input');

        // 이벤트 리스너가 여러 번 등록되지 않도록 이전 리스너 제거
        chatInput.removeEventListener('keypress', this.handleChatInput);

        // 새로 이벤트 리스너 등록
        this.handleChatInput = (e) => {
            if (e.key === 'Enter') {
                const message = chatInput.value;
                console.log('전송할 채팅 메시지:', message);
                if (message) {
                    this.socket.send(JSON.stringify({
                        type: 'chat',
                        message: message
                    }));
                    chatInput.value = ''; // 입력 후 초기화
                }
            }
        };

        chatInput.addEventListener('keypress', this.handleChatInput);
    }






    handlePuzzleSolved(portalPosition) {
        // 퍼즐을 해결한 경우
        addToConsole("Puzzle solved by another player!");
        this.puzzleSolved = true;
        //this.inputPuzzleItem.destroy();

        if (this.puzzleStack >= this.maxstack) {
            addToConsole("All switches activated! Creating portal...");
            this.createPortal(portalPosition.x, portalPosition.y); // 포탈 위치 전달
        }

        // 포탈 생성 정보를 서버로 전송
        this.socket.send(JSON.stringify({
            type: 'puzzleSolved',
            x: portalPosition.x,
            y: portalPosition.y
        }));
    }



    handleChatMessage(data) {
        const consoleElement = document.getElementById('console');
        if (!consoleElement) {
            console.error('console element not found!');
            return;
        }

        const playerName = `Player ${data.playerId}`;
        const message = data.message;
        const chatMessage = `${playerName}: ${message}\n`;

        // 기존 메시지에 추가
        consoleElement.textContent += chatMessage;

        // 스크롤을 맨 아래로 내리기 (필요 시)
        consoleElement.scrollTop = consoleElement.scrollHeight;
    }





    // createPortal(x, y) {
    //     const portal = this.physics.add.sprite(x, y, 'portal');
    //     this.physics.add.overlap(this.players[this.playerId], portal, this.interactWithPortal, null, this);
    //     addToConsole(`Portal created at (${x}, ${y})`);
    // }



    // interactWithPortal(player, portal) {
    //     if (!player || !portal || this.portalInteractionComplete) return;

    //     if (Phaser.Math.Distance.Between(player.x, player.y, portal.x, portal.y) < 50) {
    //         if (!this.portalInteractionDelay) {
    //             addToConsole("You are near the portal. Press UP to interact.");
    //             this.portalInteractionDelay = true;

    //             const upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    //             upKey.once('down', () => {
    //                 if (this.physics.overlap(player, portal)) {
    //                     addToConsole("Interacting with portal...");
    //                     this.portalInteractionComplete = true;
    //                     endGame();
    //                 }
    //             });

    //             this.time.delayedCall(2000, () => {
    //                 this.portalInteractionDelay = false;
    //             });
    //         }
    //     }
    // }


    createPortal(x, y) {
    const portal = this.physics.add.sprite(x, y, 'portal');
    this.physics.add.overlap(this.players[this.playerId], portal, this.interactWithPortal, null, this);
    addToConsole(`Portal created at (${x}, ${y})`);
}

interactWithPortal(player, portal) {
    if (!player || !portal || this.portalInteractionComplete) return;

    if (Phaser.Math.Distance.Between(player.x, player.y, portal.x, portal.y) < 50) {
        if (!this.portalInteractionDelay) {
            addToConsole("You are near the portal. Press UP to interact or touch the portal.");
            this.portalInteractionDelay = true;

            // 키보드 입력 처리
            const upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
            upKey.once('down', () => {
                if (this.physics.overlap(player, portal)) {
                    addToConsole("Interacting with portal...");
                    this.portalInteractionComplete = true;
                    endGame();
                }
            });

            // 터치 입력 처리
            this.input.on('pointerdown', (pointer) => {
                if (this.physics.overlap(player, portal)) {
                    addToConsole("Interacting with portal...");
                    this.portalInteractionComplete = true;
                    endGame();
                }
            });

            this.time.delayedCall(2000, () => {
                this.portalInteractionDelay = false;
            });
        }
    }
}


    update() {
        if (this.playerId) {
            const player = this.players[this.playerId];
            if (player) {
                this.handlePlayerMovement(player);
                this.checkProximityForHint(player); // 첫 번째 힌트 체크
                this.checkProximityForPuzzleSolve(player); // 첫 번째 퍼즐 체크
                this.checkProximityForHint2(player); // 두 번째 힌트 체크
                this.checkProximityForPuzzleSolve2(player); // 두 번째 퍼즐 체크
                this.checkProximityForSwitchHint(player); // 스위치 힌트 체크
            }
        }
        this.handleTouchMovement(); // 터치 이동 핸들러 호출
    }



    handlePlayerMovement(player) {
        const speed = 15;
        if (this.cursors.left.isDown) {
            player.x -= speed;
            this.sendPlayerPosition(player);
        } else if (this.cursors.right.isDown) {
            player.x += speed;
            this.sendPlayerPosition(player);
        } else if (this.cursors.up.isDown) {
            player.y -= speed;
            this.sendPlayerPosition(player);
        } else if (this.cursors.down.isDown) {
            player.y += speed;
            this.sendPlayerPosition(player);
        }
    }

    // New function to handle touch movements
    handleTouchMovement() {
        this.input.on('pointerdown', (pointer) => {
            // Move player to the touch position
            const targetX = pointer.x;
            const targetY = pointer.y;

            // Update player position based on touch location
            this.movePlayerTo(targetX, targetY);
        });
    }

    movePlayerTo(x, y) {
        const player = this.players[this.playerId];
        if (player) {
            // Update player position
            player.x = x;
            player.y = y;
            this.sendPlayerPosition(player);
        }
    }

    sendPlayerPosition(player) {
        this.socket.send(JSON.stringify({
            type: 'move',
            x: player.x,
            y: player.y
        }));
    }



    // update() {
    //     if (this.playerId) {
    //         const player = this.players[this.playerId];
    //         if (player) {
    //             this.handlePlayerMovement(player);
    //             this.checkProximityForHint(player);
    //             this.checkProximityForPuzzleSolve(player);
    //         }
    //     }

    // }



    // handlePlayerMovement(player) {
    //     const speed = 15;
    //     if (this.cursors.left.isDown) {
    //         player.x -= speed;
    //         this.sendPlayerPosition(player);
    //     } else if (this.cursors.right.isDown) {
    //         player.x += speed;
    //         this.sendPlayerPosition(player);
    //     } else if (this.cursors.up.isDown) {
    //         player.y -= speed;
    //         this.sendPlayerPosition(player);
    //     } else if (this.cursors.down.isDown) {
    //         player.y += speed;
    //         this.sendPlayerPosition(player);
    //     }
    // }

    // sendPlayerPosition(player) {
    //     this.socket.send(JSON.stringify({ type: 'move', x: player.x, y: player.y }));
    // }
}



function addToConsole(message) {
    const consoleElement = document.getElementById('console');
    const p = document.createElement('p');
    p.textContent = message;
    consoleElement.appendChild(p);
    consoleElement.scrollTop = consoleElement.scrollHeight;
}

function endGame() {
    const playTime = game.scene.keys.GameScene.playTime;
    const role = game.scene.keys.GameScene.playerRole;

    const gameData = {
        uid: getCookie('uid'),
        playTime: playTime,
        Role: role,
        Score: calculateScore(playTime, role)
    };

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/saveGameDataSocket', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log('Game data sent successfully');
            window.location.href = '/ranking';
        } else if (xhr.readyState == 4) {
            console.error('Error sending game data');
        }
    };

    xhr.send(JSON.stringify(gameData));
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function calculateScore(playTime, role) {
    let baseScore = 1000 - playTime;
    if (role === 'Hint Giver') {
        baseScore += 100;
    }
    return baseScore > 0 ? baseScore : 0;
}


const config = {
    type: Phaser.AUTO,
    width: getGameWidth(), // Dynamic width based on function
    height: getGameHeight(), // Dynamic height based on function
    parent: 'game-container',
    scene: GameScene,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

// Function to calculate width dynamically based on screen size and orientation
function getGameWidth() {
    if (window.innerWidth < 600) {
        return window.innerWidth * 0.95; // For smaller mobile devices, use 95% of the width
    }
    return Math.max(window.innerWidth * 0.8, 800); // Otherwise, use 80% or min 800px
}

// Function to calculate height dynamically based on screen size and orientation
function getGameHeight() {
    if (window.innerHeight < 600) {
        return window.innerHeight * 0.85; // For smaller mobile devices, use 85% of the height
    }
    return Math.max(window.innerHeight * 0.8, 700); // Otherwise, use 80% or min 700px
}

// Resize the game when the window is resized
window.addEventListener('resize', () => {
    const newWidth = getGameWidth();
    const newHeight = getGameHeight();
    game.scale.resize(newWidth, newHeight);
});


// const config = {
//     type: Phaser.AUTO,
//     width: window.innerWidth * 0.8, // 전체 너비의 80% 사용
//     height: window.innerHeight * 0.8, // 전체 높이의 80% 사용
//     parent: 'game-container',
//     scene: GameScene,
//     physics: {
//         default: 'arcade',
//         arcade: {
//             gravity: {
//                 y: 0
//             },
//             debug: false
//         }
//     },
//     scale: {
//         mode: Phaser.Scale.FIT, // 화면 비율 유지
//         autoCenter: Phaser.Scale.CENTER_BOTH // 중앙 정렬
//     }
// };

// const game = new Phaser.Game(config);
