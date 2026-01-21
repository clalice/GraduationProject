<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <!DOCTYPE html>
    <html lang="ko">

    <head>
        <meta charset="UTF-8">
        <title>게임 선택 페이지</title>
        <link rel="stylesheet" href="./style1.css" type="text/css">
        <link rel="stylesheet" href="./gameselect.css" type="text/css">
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
        <div class="content_section gameselect-content">
            <div class="container">
                <h1>게임 선택</h1>
                <p>원하는 게임을 선택하여 즐기세요!</p>

                <div class="games_section">
                    <!-- Game 1 -->
                    <div class="game_item">
                        <a href="http://localhost:3000/phasergame">
                            <img src="./images/game1.jpg" alt="게임 1 이미지" class="game_image">
                        </a>
                        <h2>게임 1: 타임어택 점프게임</h2>
                        <p>빠르게 점프하며 높은 점수를 기록하세요! 시간 내에 가능한 한 멀리 가보세요.</p>
                    </div>

                    <!-- Game 2 -->
                    <div class="game_item">
                        <a href="http://localhost:3000/secondgame">
                            <img src="./images/game2.jpg" alt="게임 2 이미지" class="game_image">
                        </a>
                        <h2>게임 2: 멀티 플레이 퍼즐 탈출게임</h2>
                        <p>친구와 함께 퍼즐을 풀며 탈출하세요! 웹 소켓을 이용한 실시간 협동 게임.</p>
                    </div>
                </div>
            </div>
        </div>
    </body>

    </html>