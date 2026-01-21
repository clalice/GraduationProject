<!-- <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Button Click Example with Ajax</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
</head>
<body>
    <h2>Click the button to execute a Java function</h2>
    <button id="runButton">Run Java Code with Ajax</button>
    
    <div id="resultDiv"></div>

    <script>
        $(document).ready(function(){
            $('#runButton').click(function(){
                $.ajax({
                    type: "POST",
                    url: "/MyServlet", // 서블릿의 URL 매핑 경로
                    success: function(result){
                        console.log("Result: " + result); // 결과를 콘솔에 출력
                        $('#resultDiv').html("<p>Result: " + result + "</p>");
                    }
                });
            });
        });
    </script>
    
</body>
</html>


<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>JSP Java Interaction</title>
</head>
<body>
    <h1>JSP Java Interaction Example</h1>
    
    <form action="JavaClass" method="post">
        <input type="submit" value="Click to Print Message">
    </form>
    
    <div>
        <h2>Output:</h2>
        <%= request.getAttribute("message") %>
    </div>
</body>
</html> -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSP Example</title>
</head>
<body>
    <h2>Click the button to get the result:</h2>
    <button onclick="getResult()">Get Result</button>
    <div id="output"></div>

    <script>
        function getResult() {
            fetch('getResult.jsp')
                .then(response => response.text())
                .then(data => {
                    document.getElementById('output').innerText = data;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    </script>
</body>
</html>
