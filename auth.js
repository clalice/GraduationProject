const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser');
const http = require('http');
const crypto = require('crypto');
const requestIp = require('request-ip');
const db = require('./db'); // 수정된 부분
var authcheck = require('./authcheck.js');
var template = require('./template.js');
const app = express();
const server = http.createServer(app);
var router = express.Router();

const cookieParser = require('cookie-parser');
app.use(cookieParser());


module.exports = router;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(requestIp.mw());

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

//라우팅
app.use('/', router);


function getRandomuid(min, max) { //min ~ max 사이의 임의의 uid 정수 반환 5자리
    return Math.floor(Math.random() * (max - min)) + min;
}
function getRandomsalt(min, max) { //slat키 부여
    return Math.floor(Math.random() * (max - min)) + min;
}
// 로그인 프로세스
router.post('/login_process', async function (request, response) {
    const username = request.body.username;
    const password = request.body.pwd;

    if (username && password) {
        let conn;
        try {
            conn = await db.getConnection(); // 연결 가져오기

            const results = await conn.query('SELECT * FROM user WHERE id = ?', [username]); // 유저 조회
            if (results.length === 0) {
                return response.send(`<script type="text/javascript">
                    alert("해당하는 아이디가 없습니다.");
                    document.location.href = "/login.html"; </script>`); // 수정된 부분
            }

            const uid = results[0]['uid'];
            const storedHashedPassword = results[0]['pass'];

            const data = await conn.query('SELECT * FROM hash WHERE uid = ?', [uid]); // 암호화 키 조회
            if (data.length === 0) {
                return response.send(`<script type="text/javascript">
                    alert("해당하는 아이디의 암호화 정보가 없습니다.");
                    document.location.href = "/login.html"; </script>`); // 수정된 부분
            }

            const salt = data[0]['saltkey'];
            const hashedPassword = crypto.createHash('sha256').update(salt + password).digest('hex');

            if (hashedPassword === storedHashedPassword) {
                // 쿠키 설정 (uid를 쿠키에 저장)
                response.cookie('uid', uid, {
                    maxAge: 24 * 60 * 60 * 1000 , 
                    httpOnly: true, // 클라이언트에서 자바스크립트로 쿠키에 접근하지 못하도록 설정
                    secure: true, // HTTPS에서만 전송
                });

                console.log('\x1b[32m User Connect : \x1b[0m' + username);
                console.log("client IP: " + requestIp.getClientIp(request));
                response.redirect("/mainpage2.html"); // 메인 페이지로 리디렉션
            } else {
                response.send(`<script type="text/javascript">
                    alert("비밀번호가 일치하지 않습니다.");
                    document.location.href = "/login.html"; </script>`); // 수정된 부분
            }
        } catch (error) {
            console.error(error); // 에러 출력
            response.send(`<script type="text/javascript">
                alert("로그인 중 오류가 발생했습니다.");
                document.location.href = "/login.html"; </script>`); // 수정된 부분
        } finally {
            if (conn) conn.release(); // 연결 해제
        }
    } else {
        response.send(`<script type="text/javascript">
            alert("아이디와 비밀번호를 모두 입력해주세요.");
            document.location.href = "/login.html"; </script>`); // 수정된 부분   
    }
});

// 로그아웃
router.get('/logout', function (request, response) {
    username = request.session.nickname;
    console.log('\x1b[32m User DisConnect : \x1b[0m' + username); //로그아웃 세션 파괴 로그
    request.session.destroy(function (err) {
        response.redirect('/index2.html'); // 이 부분도 바꾸지 않음
    });
});

// 회원가입
router.post('/register_process', async function(request, response) { // async 키워드 추가
    var username = request.body.username;
    var password = request.body.pwd;    
    var password2 = request.body.pwd2;
    var email = request.body.email; 
    if (username && password && password2) {
        if (password !== password2) {
            response.send(`<script type="text/javascript">
                alert("입력된 비밀번호가 서로 다릅니다.");
                document.location.href = "/register.html"; // 수정된 부분
            </script>`);
            return;
        }

        let conn; // 연결 변수
        try {
            conn = await db.getConnection(); // 연결 가져오기
            const results = await conn.query('SELECT * FROM user WHERE id = ?', [username]); // 쿼리 실행
            
            if (results.length > 0) {
                response.send(`<script type="text/javascript">
                    alert("이미 존재하는 아이디입니다.");
                    document.location.href = "/register.html"; // 수정된 부분
                </script>`);
                return;
            }

            var salt = getRandomsalt(1000, 9999); // 4자리 salt값
            //암호화
            const hashedPassword = crypto.createHash('sha256').update(salt + password).digest('hex');
            const uid = getRandomuid(10000, 99999); // 5자리 uid

            await conn.query('INSERT INTO user (id, pass, email, uid, salt) VALUES (?, ?, ?, ?, ?)',
                [username, hashedPassword, email, uid, salt]); // 쿼리 실행
            await conn.query('INSERT INTO hash (saltkey, uid) VALUES (?, ?)', [salt, uid]); // 쿼리 실행

            console.log(username + ' 유저가 회원가입');
            console.log(username + ' 유저의 UID: ' + uid);
            console.log(username + ' 의 부여받은 key: ' + salt);
            response.send(`<script type="text/javascript">
                alert("회원가입이 완료되었습니다! 확인을 누르시면 마지막 페이지로 이동");
                document.location.href = "/register.html"; // 수정된 부분
            </script>`);
        } catch (error) {
            console.error(error); // 에러 출력
            response.send(`<script type="text/javascript">
                alert("회원가입 중 오류가 발생했습니다.");
                document.location.href = "/register.html"; // 수정된 부분
            </script>`);
        } finally {
            if (conn) conn.release(); // 연결 해제
        }
    } else {       
        response.send(`<script type="text/javascript">
            alert("입력되지 않은 정보가 있습니다.");
            document.location.href = "/register.html"; // 수정된 부분
        </script>`);
    }
});
module.exports = router;
