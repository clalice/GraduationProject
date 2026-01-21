const PORT = 3000;
const express = require('express');
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const crypto = require('crypto');
const requestIp = require('request-ip');
const db = require('./db');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const router = express.Router();
var template = require('./template.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./auth');
const cookie = require('cookie');

app.use(cookieParser());  // 쿠키 파서 미들웨어 추가

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/auth', authRouter);
var authcheck = require('./authcheck.js');

app.use('/auth', express.static(__dirname +'/auth'));

const ejs = require('ejs');
app.set('view engine', 'ejs');

app.use(session({
  secret: '~~~',	
  resave: false,
  saveUninitialized: true,
  //store:new FileStore(),
}));



const allowedOrigins = [
  'http://localhost:3000',
  'https://port-0-graduationproject-m20brdfb5c7915fd.sel4.cloudtype.app'
];

// CORS 설정
app.use(cors({
  origin: function(origin, callback) {
    // origin이 없는 요청(예: curl, Postman 등)은 허용
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true // 쿠키와 인증 정보를 포함한 요청을 허용
}));



app.use('/', router);

app.use(express.static(path.join(__dirname, './asset'))); 
app.use(express.static(path.join(__dirname, './game2'))); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(express.static(path.join(__dirname))); 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index2.html')); 
});

// 메인 페이지
app.get('/main', (req, res) => {
  if (!authcheck.isOwner(req, res)) {  
    res.redirect('/index2.html');
  } else {
    res.sendFile(path.join(__dirname, 'index2.html')); 
  }
});



server.listen(PORT, () => {
  console.log(`Server running at port : ${PORT}/`);
});


module.exports = app;


/////////////////////////////////////////////////////////////////////////////////////////////////
const WebSocket = require('ws');
let players = {}; // 플레이어 정보를 저장할 객체
let roles = ['Hint Giver', 'Puzzle Solver'];
let puzzleSolvedState = false; 
let portalPosition = null;     // 포탈 위치 정보를 저장할 변수

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', function connection(ws, req) {
  const playerId = generatePlayerId(req);
 
  ws.playerId = playerId;


  ws.on('message', function incoming(message) {
    if (message.length > 300) {  
      ws.close(1009, 'Message too large');  
      return;
    }

    const data = JSON.parse(message);

    if (data.type === 'join') {
      const initialPosition = getInitialPosition();
      const role = assignRole(); 
      players[playerId] = { x: initialPosition.x, y: initialPosition.y, role: role };

      ws.send(JSON.stringify({
        type: 'playerId',
        playerId,
        x: initialPosition.x,
        y: initialPosition.y,
        role: role
      }));

      broadcastPlayers();
    } 
    else if (data.type === 'move') {
      const player = players[ws.playerId];
      if (player) {
        player.x = data.x;
        player.y = data.y;
        broadcastPlayers();
      }
    } 
    else if (data.type === 'chat') {
      broadcastChatMessage(data.message, ws.playerId);
    } 
    else if (data.type === 'puzzleSolved') {
      if (!puzzleSolvedState) { // 퍼즐이 아직 해결되지 않았다면
        puzzleSolvedState = true; // 퍼즐이 해결된 상태로 변경
        const portalPosition = { x: data.portalX, y: data.portalY };
        broadcastPuzzleSolved(ws.playerId, portalPosition);
      }
    }


  });

  ws.on('close', function close() {
    delete players[ws.playerId];
    broadcastPlayers();
  });

  // 모든 플레이어의 위치와 역할 정보를 전송
  function broadcastPlayers() {
    const playerData = Object.keys(players).map(playerId => {
      const player = players[playerId];
      return { id: playerId, x: player.x, y: player.y, role: player.role }; // 역할 포함
    });
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'players', players: playerData }));
      }
    });
  }

  function broadcastChatMessage(message, playerId) {
    const chatMessage = { type: 'chat', message: message, playerId: playerId };
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(chatMessage));
      }
    });
  }

function broadcastPuzzleSolved(playerId, portalPosition) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'puzzleSolved',
        playerId: playerId,
        portalPosition // 포탈 위치 정보 포함
      }));
    }
  });

}


  ///////////////////////////////////////////////////////////////////////////////////////////////////

  function generatePlayerId(req) {
    const cookies = cookie.parse(req.headers.cookie || ''); 
    return cookies.uid || Math.random().toString(36).substr(2, 9); 
  }

  // 초기 플레이어 위치 지정
  function getInitialPosition() {
    const playerCount = Object.keys(players).length;
    if (playerCount === 0) {
      return { x: 0, y: 600 }; // 첫 번째 플레이어 위치
    } else if (playerCount === 1) {
      return { x: 600, y: 600 }; // 두 번째 플레이어 위치
    } else {
      return { x: 300, y: 300 }; // 추가 플레이어 위치
    }
  }

  function assignRole() {
    const currentPlayerCount = Object.keys(players).length;
    if (currentPlayerCount < roles.length) {
      return roles[currentPlayerCount]; 
    } else {
      return 'Spectator'; 
    }
  }
});

// WebSocket 핸들러 설정
server.on('upgrade', (req, socket, head) => {
  console.log('WebSocket upgrade request received');
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
    console.log('WebSocket connection established');
  });
});


async function validateUID(req, res) {
    const uid = req.cookies.uid;

    if (!uid) {
        console.error('UID가 쿠키에서 존재하지 않습니다.');
        return false;
    }

    let conn;
    try {
        conn = await db.getConnection(); 
        const results = await conn.query('SELECT uid FROM user WHERE uid = ?', [uid]);

        if (results.length > 0) {
            console.log('UID가 유효합니다:', results[0].uid);
            return true;
        } else {
            console.error('유효하지 않은 UID:', uid);
            return false;
        }
    } catch (error) {
        console.error('UID 확인 중 오류 발생:', error);
        return false;
    } finally {
        if (conn) conn.release();
    }
}

app.get('/phasergame', async (req, res) => {
    console.log("Request received for /phasergame");

    if (await validateUID(req, res)) {
        res.sendFile(path.join(__dirname, 'asset', 'phasergame.html'));
    } else {
        res.send(`<script type="text/javascript">
            alert("유효하지 않은 UID입니다.");
            window.location.href = "/login.html"; </script>`);
    }
});

app.get('/phasergame2', async (req, res) => {
    console.log("Request received for /phasergame2");

    if (await validateUID(req, res)) {
        res.sendFile(path.join(__dirname, 'asset', 'phasergame2.html'));
    } else {
        res.send(`<script type="text/javascript">
            alert("유효하지 않은 UID입니다.");
            window.location.href = "/login.html"; </script>`);
    }
});

app.get('/phasergame3', async (req, res) => {
    console.log("Request received for /phasergame3");

    if (await validateUID(req, res)) {
        res.sendFile(path.join(__dirname, 'asset', 'phasergame3.html'));
    } else {
        res.send(`<script type="text/javascript">
            alert("유효하지 않은 UID입니다.");
            window.location.href = "/login.html"; </script>`);
    }
});

app.get('/mypage', async (req, res) => {
    const newuid = req.cookies.uid;

    if (!newuid) {
        return res.sendFile(path.join(__dirname, './uidprompt.html'));
    }

    let conn;
    try {
        conn = await db.getConnection();

        // 사용자 정보를 가져옵니다.
        const userResults = await conn.query('SELECT * FROM user WHERE uid = ?', [newuid]);
        const userData = userResults[0];

        if (userData) {
            // 게임 데이터를 가져옵니다. 이 쿼리는 게임에 따라 조정할 수 있습니다.
            const rankingQuery = 'SELECT * FROM gpdb.ranking WHERE uid = ? ORDER BY `rank` ASC';
            const rankingResults = await conn.query(rankingQuery, [userData.id]);

            rankingResults.forEach((row) => {
                row.player_name = maskName(row.playername); // 필요한 경우 이름 마스킹
            });

            res.render('mypage', {
                userData,
                rankingData: rankingResults
            });
        } else {
            res.send(`<script type="text/javascript">
            alert("사용자를 찾을 수 없습니다.");
            document.location.href = "./uidprompt.html"; </script>`);
        }
    } catch (error) {
        console.error('사용자 정보를 불러오는 중 오류 발생:', error);
        res.send(`<script type="text/javascript">
        alert("UID 조회 실패");
        document.location.href = "./uidprompt.html"; </script>`);
    } finally {
        if (conn) conn.release();
    }
});





app.get('/secondgame', (req,res)=>{
  res.sendFile(path.join(__dirname, 'game2', 'secondgame.html'));
});

app.post('/uidprompt', (req, res) => {
    const uid = req.body.uid;
    res.cookie('uid', uid, { maxAge: 360000, httpOnly: true });
    res.redirect('/phasergame');
});






app.set('view engine', 'ejs');
function maskName(name) {
  if (name.length <= 4) {
    return name;
  }
  
  const charsToMask = name.length - 4;
  
  const maskedPart = "*".repeat(charsToMask);
  
  return name.slice(0, -4) + maskedPart + name.slice(-4);
}

app.get('/ranking', async (req, res) => {
  const rankingQuery = 'SELECT * FROM gpdb.ranking ORDER BY `rank` ASC';
  const ranking2Query = 'SELECT * FROM gpdb.ranking2 ORDER BY `clearTime` ASC'; 

  let conn; 
  try {
    conn = await db.getConnection();

    const rankingResults = await conn.query(rankingQuery);
    const ranking2Results = await conn.query(ranking2Query);

    rankingResults.forEach((row) => {
      row.player_name = maskName(row.playername);
    });

    ranking2Results.forEach((row) => {
      row.player_name = maskName(row.playername);
    });

    res.render('ranking', { rankingData: rankingResults, ranking2Data: ranking2Results });
  } catch (error) {
    console.error('랭킹 데이터 조회 중 오류 발생:', error);
    res.status(500).send('랭킹 데이터 조회 중 오류가 발생했습니다.');
  } finally {
    if (conn) conn.release();
  }
});


// app.post('/saveGameData', async (req, res) => {
//   var gameData = req.body;
//   const cookieuid = req.cookies.uid;
//   console.log(cookieuid, finalData .totalPlayTime, finalData .totalDropcoin, finalData .totalDropstar, finalData .totalDropitem);

//   if (!cookieuid) {
//     return res.status(400).send('UID가 없습니다.');
//   }

//   let conn; 
//   try {
//     conn = await db.getConnection(); 

//     const results = await conn.query('SELECT id, wincount, losecount, rate, playcount FROM gpdb.user WHERE uid = ?', [cookieuid]);
//     if (results.length === 0) {
//       console.error('유저를 찾을 수 없습니다:', cookieuid);
//       return res.status(404).send('유저를 찾을 수 없습니다.');
//     }

//     var playerId = results[0].id;
//     var wincount = results[0].wincount + 1; 
//     var playcount = results[0].playcount + 1;
//     var rate = calculateWinRate(wincount, playcount); // 승률 계산
//     var newWinrate = rate.toFixed(2); // 소수점 둘째자리까지 표시
//     var rank = calculateRank(gameData.totalPlayTime, gameData.totalDropcoin, gameData.totalDropitem); //랭크 계산

//     // 데이터베이스 업데이트 쿼리
//     await conn.query('UPDATE gpdb.user SET wincount = ?, playcount = ?, rate = ? WHERE uid = ?', 
//     [wincount, playcount, newWinrate, cookieuid]);
//     console.log('유저 정보가 성공적으로 업데이트되었습니다.');

//     // 게임 데이터가 이미 있는지 확인
//     const gameResults = await conn.query('SELECT * FROM game1 WHERE uid = ?', [cookieuid]);
//     if (gameResults.length > 0) {
//       await conn.query('UPDATE game1 SET playername = ?, playTime = ?, dropcoin = ?, dropstar = ?, dropitem = ? WHERE uid = ?', 
//       [playerId, gameData.totalPlayTime, gameData.totalDropcoin, gameData.totalDropstar, gameData.totalDropitem, cookieuid]);
//       console.log('게임 데이터가 성공적으로 업데이트되었습니다.');

//       // 랭킹 데이터 업데이트
//       const rankResults = await conn.query('SELECT uid FROM ranking WHERE uid = ?', [cookieuid]);
//       if (rankResults.length > 0) {
//         await conn.query('UPDATE ranking SET `rank` = ?, playername = ?, cleartime = ?, itemcount = ?, winrate = ?, score = ? WHERE uid = ?',
//             [rank, playerId, finalData .totalPlayTime, finalData .totalDropitem, rate, finalData .totalDropstar, cookieuid]);
//         console.log('랭킹 데이터가 성공적으로 업데이트되었습니다.');
//         res.redirect('/ranking');
//       } else {
//         await conn.query('INSERT INTO ranking (`rank`, uid, playername, cleartime, itemcount, winrate, score) VALUES (?, ?, ?, ?, ?, ?, ?)',
//             [rank, cookieuid, playerId, finalData .totalPlayTime, finalData .totalDropitem, rate, finalData .totalDropstar]);
//         console.log('랭킹 데이터가 성공적으로 저장되었습니다.');
//         res.redirect('/ranking');
//       }
//     } else {
//       // 게임 데이터가 없는 경우 새로 삽입
//       await conn.query('INSERT INTO game1 (uid, playername, playTime, dropcoin, dropstar, dropitem) VALUES (?, ?, ?, ?, ?, ?)',
//       [cookieuid, playerId, finalData .totalPlayTime, finalData .totalDropcoin, finalData .totalDropstar, finalData .totalDropitem]);
//       console.log('게임 데이터가 성공적으로 저장되었습니다.');

//       const rankResults = await conn.query('SELECT uid FROM ranking WHERE uid = ?', [cookieuid]);
//       if (rankResults.length > 0) {
//         await conn.query('UPDATE ranking SET `rank` = ?, playername = ?, cleartime = ?, itemcount = ?, winrate = ?, score = ? WHERE uid = ?',
//             [rank, playerId, finalData .totalPlayTime, finalData .totalDropitem, rate, finalData .totalDropstar, cookieuid]);
//         console.log('랭킹 데이터가 성공적으로 업데이트되었습니다.');
//         res.redirect('/ranking');
//       } else {
//         await conn.query('INSERT INTO ranking (`rank`, uid, playername, cleartime, itemcount, winrate, score) VALUES (?, ?, ?, ?, ?, ?, ?)',
//             [rank, cookieuid, playerId, finalData .totalPlayTime, finalData .totalDropitem, rate, finalData .totalDropstar]);
//         console.log('랭킹 데이터가 성공적으로 저장되었습니다.');
//         res.redirect('/ranking');
//       }
//     }
//   } catch (error) {
//     console.error('오류 발생:', error);
//     res.status(500).send('오류가 발생했습니다.');
//   } finally {
//     if (conn) conn.release(); // 연결 해제
//   }
// });

// // 승률을 계산하는 함수
// function calculateWinRate(wincount, playcount) {
//   if (playcount === 0) {
//       return 0;
//   }
//   return (wincount / playcount) * 100;
// }

// // 랭크를 계산하는 함수
// function calculateRank(playtime, dropcoin, dropitem) {
//   const playtimeScore = Math.floor(1000 / (playtime + 1));
//   const dropScore = dropcoin + dropitem;
//   const rank = playtimeScore + dropScore;
//   return rank;
// }

app.post('/saveGameData', async (req, res) => {
  var gameData = req.body; // This should contain the finalData structure
  const cookieuid = req.cookies.uid;
  console.log(cookieuid, gameData.totalPlayTime, gameData.totalDropcoin, gameData.totalDropstar, gameData.totalDropitem);

  if (!cookieuid) {
    return res.status(400).send('UID가 없습니다.');
  }

  let conn; 
  try {
    conn = await db.getConnection(); 

    const results = await conn.query('SELECT id, wincount, losecount, rate, playcount FROM gpdb.user WHERE uid = ?', [cookieuid]);
    if (results.length === 0) {
      console.error('유저를 찾을 수 없습니다:', cookieuid);
      return res.status(404).send('유저를 찾을 수 없습니다.');
    }

    var playerId = results[0].id;
    var wincount = results[0].wincount + 1; 
    var playcount = results[0].playcount + 1;
    var rate = calculateWinRate(wincount, playcount); // 승률 계산
    var newWinrate = rate.toFixed(2); // 소수점 둘째자리까지 표시
    var rank = calculateRank(gameData.totalPlayTime, gameData.totalDropcoin, gameData.totalDropitem); // 랭크 계산

    // 데이터베이스 업데이트 쿼리
    await conn.query('UPDATE gpdb.user SET wincount = ?, playcount = ?, rate = ? WHERE uid = ?', 
    [wincount, playcount, newWinrate, cookieuid]);
    console.log('유저 정보가 성공적으로 업데이트되었습니다.');

    // 게임 데이터가 이미 있는지 확인
    const gameResults = await conn.query('SELECT * FROM game1 WHERE uid = ?', [cookieuid]);
    if (gameResults.length > 0) {
      await conn.query('UPDATE game1 SET playername = ?, playTime = ?, dropcoin = ?, dropstar = ?, dropitem = ? WHERE uid = ?', 
      [playerId, gameData.totalPlayTime, gameData.totalDropcoin, gameData.totalDropstar, gameData.totalDropitem, cookieuid]);
      console.log('게임 데이터가 성공적으로 업데이트되었습니다.');

      // 랭킹 데이터 업데이트
      const rankResults = await conn.query('SELECT uid FROM ranking WHERE uid = ?', [cookieuid]);
      if (rankResults.length > 0) {
        await conn.query('UPDATE ranking SET `rank` = ?, playername = ?, cleartime = ?, itemcount = ?, winrate = ?, score = ? WHERE uid = ?',
            [rank, playerId, gameData.totalPlayTime, gameData.totalDropitem, rate, gameData.totalDropstar, cookieuid]);
        console.log('랭킹 데이터가 성공적으로 업데이트되었습니다.');
        res.redirect('/ranking');
      } else {
        await conn.query('INSERT INTO ranking (`rank`, uid, playername, cleartime, itemcount, winrate, score) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [rank, cookieuid, playerId, gameData.totalPlayTime, gameData.totalDropitem, rate, gameData.totalDropstar]);
        console.log('랭킹 데이터가 성공적으로 저장되었습니다.');
        res.redirect('/ranking');
      }
    } else {
      // 게임 데이터가 없는 경우 새로 삽입
      await conn.query('INSERT INTO game1 (uid, playername, playTime, dropcoin, dropstar, dropitem) VALUES (?, ?, ?, ?, ?, ?)',
      [cookieuid, playerId, gameData.totalPlayTime, gameData.totalDropcoin, gameData.totalDropstar, gameData.totalDropitem]);
      console.log('게임 데이터가 성공적으로 저장되었습니다.');

      const rankResults = await conn.query('SELECT uid FROM ranking WHERE uid = ?', [cookieuid]);
      if (rankResults.length > 0) {
        await conn.query('UPDATE ranking SET `rank` = ?, playername = ?, cleartime = ?, itemcount = ?, winrate = ?, score = ? WHERE uid = ?',
            [rank, playerId, gameData.totalPlayTime, gameData.totalDropitem, rate, gameData.totalDropstar, cookieuid]);
        console.log('랭킹 데이터가 성공적으로 업데이트되었습니다.');
        res.redirect('/ranking');
      } else {
        await conn.query('INSERT INTO ranking (`rank`, uid, playername, cleartime, itemcount, winrate, score) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [rank, cookieuid, playerId, gameData.totalPlayTime, gameData.totalDropitem, rate, gameData.totalDropstar]);
        console.log('랭킹 데이터가 성공적으로 저장되었습니다.');
        res.redirect('/ranking');
      }
    }
  } catch (error) {
    console.error('오류 발생:', error);
    res.status(500).send('오류가 발생했습니다.');
  } finally {
    if (conn) conn.release(); // 연결 해제
  }
});

// 승률을 계산하는 함수
function calculateWinRate(wincount, playcount) {
  if (playcount === 0) {
      return 0;
  }
  return (wincount / playcount) * 100;
}

// 랭크를 계산하는 함수
function calculateRank(playtime, dropcoin, dropitem) {
  const playtimeScore = Math.floor(1000 / (playtime + 1));
  const dropScore = dropcoin + dropitem;
  const rank = playtimeScore + dropScore;
  return rank;
}





app.post('/saveGameDataSocket', async (req, res) => {
  const gameData = req.body;
  const cookieuid = req.cookies.uid;
  console.log(cookieuid, gameData.playTime, gameData.Role, gameData.Score);

  if (!cookieuid) {
    return res.status(400).send('UID가 없습니다.');
  }

  let conn; // 연결 변수
  try {
    conn = await db.getConnection(); // 연결 가져오기

    // 1. 유저 데이터 가져오기
    const results = await conn.query('SELECT id, wincount, losecount, rate, playcount FROM gpdb.user WHERE uid = ?', [cookieuid]);
    if (results.length === 0) {
      console.error('유저를 찾을 수 없습니다:', cookieuid);
      return res.status(404).send('유저를 찾을 수 없습니다.');
    }

    const playerId = results[0].id;
    const wincount = results[0].wincount + 1;
    const playcount = results[0].playcount + 1;

    // 2. 승률 및 랭크 계산
    const rate = (wincount / playcount) * 100; // 승률 계산
    const newWinrate = rate.toFixed(2);
    const rank = Math.floor(gameData.Score / 1000); // 임시 랭크 계산

    // 3. 유저 정보 업데이트
    await conn.query('UPDATE gpdb.user SET wincount = ?, playcount = ?, rate = ? WHERE uid = ?', 
      [wincount, playcount, newWinrate, cookieuid]);
    console.log('유저 정보가 성공적으로 업데이트되었습니다.');

    // 4. 게임 데이터가 있는지 확인 및 업데이트
    const gameResults = await conn.query('SELECT * FROM game2 WHERE uid = ?', [cookieuid]);
    if (gameResults.length > 0) {
      // 게임 데이터가 있으면 업데이트
      await conn.query('UPDATE game2 SET playername = ?, score = ?, cleartime = ?, Role = ? WHERE uid = ?', 
        [playerId, gameData.Score, gameData.playTime, gameData.Role, cookieuid]);
      console.log('게임 데이터가 성공적으로 업데이트되었습니다.');

      // 5. 랭킹 업데이트
      await updateRanking(conn, cookieuid, playerId, gameData, rank, newWinrate, res);
    } else {
      // 게임 데이터가 없으면 새로 삽입
      await conn.query('INSERT INTO game2 (uid, playername, score, cleartime, Role) VALUES (?, ?, ?, ?, ?)', 
        [cookieuid, playerId, gameData.Score, gameData.playTime, gameData.Role]);
      console.log('게임 데이터가 성공적으로 저장되었습니다.');

      // 5. 랭킹 업데이트
      await updateRanking(conn, cookieuid, playerId, gameData, rank, newWinrate, res);
    }
  } catch (error) {
    console.error('오류 발생:', error);
    res.status(500).send('오류가 발생했습니다.');
  } finally {
    if (conn) conn.release(); // 연결 해제
  }
});

// 랭킹 업데이트 함수
async function updateRanking(conn, uid, playerId, gameData, rank, newWinrate, res) {
  const results = await conn.query('SELECT uid FROM ranking2 WHERE uid = ?', [uid]);
  if (results.length > 0) {
    // 랭킹 데이터가 있으면 업데이트
    await conn.query('UPDATE ranking2 SET playername = ?, cleartime = ?, Role = ?, score = ? WHERE uid = ?',
      [playerId, gameData.playTime, gameData.Role, newWinrate, uid]);
    console.log('랭킹 데이터가 성공적으로 업데이트되었습니다.');
    res.redirect('/ranking');
  } else {
    // 랭킹 데이터가 없으면 새로 삽입
    await conn.query('INSERT INTO ranking2 (uid, playername, cleartime, Role, score) VALUES (?, ?, ?, ?, ?)',
      [uid, playerId, gameData.playTime, gameData.Role, newWinrate]);
    console.log('랭킹 데이터가 성공적으로 저장되었습니다.');
    res.redirect('/ranking');
  }
}




