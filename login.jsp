<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="UTF-8">
        <title>Login</title>
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
        <!-- Login Form Section -->
        <div class="form_section">
            <div class="container">
                <h1>로그인</h1>
                <form action="http://localhost:3000/auth/login_process" method="post">
                    <label for="username">아이디</label>
                    <input type="text" id="username" name="username" placeholder="아이디">
                    <label for="pwd">비밀번호</label>
                    <input type="password" id="pwd" name="pwd" placeholder="비밀번호">
                    <input type="submit" value="로그인">
                </form>
                <p>계정이 없으신가요? <a class="link" href="http://localhost:8080/register.jsp">회원가입</a></p>
            </div>
        </div>
    </body>

    </html>