<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.List" %>
<%@ page import="javax.servlet.http.HttpServletRequest" %>
<%
    // Reading parameters from the query string
    String userId = request.getParameter("userId");
    String email = request.getParameter("email");
    String uid = request.getParameter("uid");
    String wincount = request.getParameter("wincount");
    String losecount = request.getParameter("losecount");
    String rate = request.getParameter("rate");
    String playcount = request.getParameter("playcount");

    // Example game data handling; adapt as needed
    List<Map<String, String>> games = (List<Map<String, String>>) request.getAttribute("games");
%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>마이페이지</title>
    <link rel="stylesheet" href="./style1.css" type="text/css">
    <link rel="stylesheet" href="./mycss.css" type="text/css">
</head>
<body>
<!-- Navbar Section -->
<div class="navbar_section">
    <div class="navbar_main">
        <a class="navbar_logo" href="/">로고</a>
        <div class="navbar_links">
            <a href="./gameselect.jsp">Game</a>
            <a href="./Rule.jsp">Rule</a>
            <a href="./login.jsp">Login</a>
            <a href="./register.jsp">Register</a>
            <a href="http://localhost:3000/mypage">My Page</a>
        </div>
    </div>
</div>

    <br>
    <br>
    
    <h1>마이페이지</h1>
    <h2>사용자 정보</h2>
    <table class="user-info-table">
        <tr>
            <th>항목</th>
            <th>값</th>
        </tr>
        <tr>
            <td>사용자 ID</td>
            <td><%= userId %></td>
        </tr>
        <tr>
            <td>이메일</td>
            <td><%= email %></td>
        </tr>
        <tr>
            <td>UID</td>
            <td><%= uid %></td>
        </tr>
        <tr>
            <td>승리 횟수</td>
            <td><%= wincount %></td>
        </tr>
        <tr>
            <td>패배 횟수</td>
            <td><%= losecount %></td>
        </tr>
        <tr>
            <td>승률</td>
            <td><%= rate %></td>
        </tr>
        <tr>
            <td>플레이 횟수</td>
            <td><%= playcount %></td>
        </tr>
    </table>
        

    <h2>게임 데이터</h2>
    <%
        if (games != null && games.size() > 0) {
            for (Map<String, String> game : games) {
    %>
            <p>게임 ID: <%= game.get("game_id") %></p>
            <p>점수: <%= game.get("score") %></p>
            <hr>
    <%
            }
        } else {
    %>
        <p>게임 데이터를 불러올 수 없습니다.</p>
    <%
        }
    %>
</body>
</html>
