var db = require('./db');
var express = require('express');
var router = express.Router();


// module.exports = {
//     isOwner: function (request, response) {
//       if (request.session.is_logined) {
//         return true;
//       }
//       else {
//         return false;
//       }
//     },
//     statusUI: function (request, response,results) {
//       var authStatusUI = '로그인후 사용 가능합니다'
//       if (this.isOwner(request, response)) {
//         authStatusUI = `
//         <h3>${request.session.nickname} 님 환영합니다 </h3>
//         <h4>| <a href="/auth/logout">로그아웃</a> | </h4>
//         `;
//       }
//       return authStatusUI;
//     }
//   }

const authcheck = {
  isOwner: function (request, response) {
      if (request.session && request.session.is_logined) {
          return true;
      } else {
          return false;
      }
  },
  statusUI: function (request, response, results) {
      var authStatusUI = '로그인후 사용 가능합니다';
      if (this.isOwner(request, response)) {
          authStatusUI = `
          <h3>${request.session.nickname} 님 환영합니다</h3>
          <h4>| <a href="/auth/logout">로그아웃</a> | </h4>
          `;
      }
      return authStatusUI;
  }
};

module.exports = authcheck;
