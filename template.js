module.exports = {
    HTML: function (title, body, authStatusUI) {
        return `
    <!doctype html>
    <html>
    <head>    
      <title>Login TEST - ${title}</title>
      <meta charset=" utf-8">
      <style>
        @import url(http://fonts.googleapis.com/earlyaccess/notosanskr.css);

        body {
            font-family: 'Noto Sans KR', sans-serif;
            margin: 50px;
            background-color: #9292d9;
            opacity: 0.7;
            background-image: radial-gradient(#3e429b 0.6000000000000001px, #9292d9 0.6000000000000001px);
            background-size: 12px 12px;

        }
        .h4 {
          font-family: "Times New Roman", Times, serif;
          font-weight: 300;
          font-size: 26px;
          line-height: 1.4em;
          color: #404040;
         }
        
        .h4 span {
          color: #dfdeee;
          font-weight: lighter;
        }
        .background {
            background-color: white;
            height: auto;
            width: 99%;
            max-width: 800px;
            padding: 10px;
            margin: 0 auto;
            border-radius: 5px;
            box-shadow: 0px 40px 30px -20px rgba(0, 0, 0, 0.3);
            text-align: center;
        }

        form {
            display: flex;
            padding: 30px;
            flex-direction: column;
        }

        .login {
            border: none;
            border-bottom: 2px solid #D1D1D4;
            background: none;
            padding: 10px;
            font-weight: 700;
            transition: .2s;
            width: 75%;
        }
        .login:active,
        .login:focus,
        .login:hover {
            outline: none;
            border-bottom-color: #6A679E;
        }

        .btn {            
            border: none;
            width: 75%;
            background-color: #6A679E;
            color: white;
            padding: 15px 0;
            font-weight: 600;
            border-radius: 5px;
            cursor: pointer;
            transition: .2s;
        }
        .btn:hover {
            background-color: #595787;
        }
        .box{
            background: #f6f5f7;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            font-family: 'Montserrat', sans-serif;
            height: 150vh;
            margin: -10px 0 40px;
        }
        @import url(https://fonts.googleapis.com/css?family=Source+Sans+Pro);
.snip1504 {
  font-family: 'Source Sans Pro', sans-serif;
  position: relative;
  overflow: hidden;
  margin: 10px;
  min-width: 230px;
  max-width: 315px;
  width: 100%;
  color: #000000;
  text-align: left;
  font-size: 16px;
  background-color: #fff;
}

.snip1504 * {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-transition: all 0.45s ease;
  transition: all 0.45s ease;
}

.snip1504 img {
  vertical-align: top;
  max-width: 100%;
  backface-visibility: hidden;
}

.snip1504 figcaption {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  align-items: center;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.snip1504 h3,
.snip1504 h5 {
  margin: 0;
  opacity: 0;
  letter-spacing: 1px;
}

.snip1504 h3 {
  -webkit-transform: translateY(-100%);
  transform: translateY(-100%);
  text-transform: uppercase;
  font-weight: 400;
}

.snip1504 h5 {
  font-weight: normal;
  font-style: italic;
  color: #888;
  -webkit-transform: translateY(100%);
  transform: translateY(100%);
}

.snip1504 a {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.snip1504:hover > img,
.snip1504.hover > img {
  opacity: 0.1;
}

.snip1504:hover h3,
.snip1504.hover h3,
.snip1504:hover h5,
.snip1504.hover h5 {
  -webkit-transform: translateY(0);
  transform: translateY(0);
  opacity: 1;
}

hr[role="tournament1"] {
    border: 0px solid;
    height: 1px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(172, 131, 83, 0.75), rgba(0, 0, 0, 0));
    margin: 32px 0px;
    display: block;
}
hr[role="tournament1"]::before {
    position: absolute;
    background-color: #efefef;
    border: 1px solid;
    border-color: #AC8353;
    border-left: 0px solid;
    border-top: 0px solid;
    padding: 10px;
    transform: rotate(45deg);
    left: 50%;
    margin: -10px 0px 0px -22px;
    content: "";
}       

.styled-paragraph {
  padding: 5px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 15px;
  color: #333;
  line-height: 1.5;
}

    </style>
    </head>
    <body>
      <div class="background">
        ${authStatusUI}
        ${body}
      </div>
    </body>
    </html>
    `;
    }
}