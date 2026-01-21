<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <!DOCTYPE html>
    <html lang="ko">

    <head>
        <meta charset="UTF-8">
        <title>메인페이지</title>
        <link rel="stylesheet" href="./style1.css" type="text/css">
        <link rel="stylesheet" href="./mainpage2.css" type="text/css">
    </head>

    <body>
        <div class="navbar_section">
            <div class="navbar_main">
                <a class="navbar_logo" href="/">로고</a>
                <div class="navbar_links">
                    <a href="./gameselect.jsp">Game</a>
                    <a href="./Rule.jsp">Rule</a>
                    <a href="./login.jsp">Login</a>
                    <a href="./register.jsp">Register</a>
                    <a href="http://localhost:3000/mypage">My Page</a>
                    <a href="http://localhost:3000/ranking">Ranking</a>
                </div>
            </div>
        </div>


        <!-- Main Content Section -->
        <div class="content_section mainpage-content">
            <div class="container">
                <h1>로그인에 성공하셨습니다.</h1>
                <h2>상단의 메뉴바를 통해 사이트를 자유롭게 이용해 주시기 바랍니다.</h2>

                <p>원하는 페이지로 이동하려면 상단 메뉴를 사용하세요:</p>
                <ul>
                    <li><strong>Game:</strong> 타임어택 점프 게임을 즐기세요. 빠르게 점프하고 높은 점수를 기록해 보세요.</li>
                    <li><strong>Rule:</strong> 각 게임의 규칙 및 사이트 이용 방법을 확인하세요.</li>
                    <li><strong>My Page:</strong> 마이페이지에서 자신의 게임 기록과 승률을 확인할 수 있습니다.</li>
                    <li><strong>Register:</strong> 계정이 없으신 경우, 회원가입을 통해 새로운 계정을 만드실 수 있습니다.</li>
                    <li><strong>Login:</strong> 다른 계정으로 로그인하려면 이 메뉴를 이용하세요.</li>
                </ul>

                <p>게임을 시작하거나 정보를 확인하고 싶다면, 메뉴바의 링크를 클릭하여 해당 페이지로 이동하십시오. 즐거운 시간을 보내세요!</p>
            </div>
        </div>
    </body>

    </html>