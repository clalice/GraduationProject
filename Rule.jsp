<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <!DOCTYPE html>
    <html lang="ko">

    <head>
        <meta charset="UTF-8">
        <title>Rule</title>
        <link rel="stylesheet" href="./style1.css" type="text/css">
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


        <!-- Content Section -->
        <div class="content_section">
            <div class="container">
                <h1>사이트 규칙 (Rule)</h1>

                <!-- 1. 타임어택 점프 게임 설명 -->
                <section id="game1">
                    <h2>1. 타임어택 점프 게임</h2>
                    <p>타임어택 점프 게임은 제한된 시간 안에 가능한 높은 점수를 기록하는 것을 목표로 하는 게임입니다.
                        플레이어는 장애물을 피하면서 점프하고, 가능한 한 많은 점수를 획득해야 합니다. 게임이 진행될수록
                        속도가 빨라지고, 도전적인 요소가 추가됩니다.</p>
                </section>

                <!-- 2. 웹 소켓 멀티 플레이 퍼즐 탈출 게임 설명 -->
                <section id="game2">
                    <h2>2. 멀티 플레이 퍼즐 탈출 게임</h2>
                    <p>이 게임은 웹 소켓 기술을 활용하여 두 명의 플레이어가 동시에 접속해 협력하는 멀티 플레이 퍼즐 탈출 게임입니다.
                        두 명이 서로 협력하여 퍼즐을 해결하고, 제한된 시간 안에 탈출해야 합니다. 실시간으로 소통하며 퍼즐을 풀어나가는
                        재미가 있는 게임입니다.</p>
                </section>

                <!-- 3. 회원가입에 대한 설명 -->
                <section id="signup">
                    <h2>3. 회원가입</h2>
                    <p>회원가입을 통해 사이트의 다양한 기능을 이용할 수 있습니다. 회원가입 시 고유한 <strong>UID</strong>가 발급되며,
                        이 UID는 게임 기록을 저장하고 마이페이지에서 확인하는 데 사용됩니다. UID는 사용자 식별에 매우 중요한 정보이므로
                        꼭 기억해두세요.</p>
                </section>

                <!-- 4. 로그인 및 마이페이지 설명 -->
                <section id="login_mypage">
                    <h2>4. 로그인 및 마이페이지</h2>
                    <p>로그인을 통해 사용자 맞춤형 서비스를 이용할 수 있으며, 마이페이지에서는 자신의 게임 기록 및 성과를 확인할 수 있습니다.
                        로그인 후 마이페이지에 접속하여 UID를 기반으로 자신의 승리/패배 기록, 승률, 플레이 횟수 등 다양한 정보를 열람할 수 있습니다.</p>
                </section>
            </div>
        </div>
    </body>

    </html>