var mysql      = require('mysql');
var connection ={
  host     : 'localhost',    // 호스트 주소
  user     : 'root',           // mysql user
  password : 'password1234!',       // mysql password
  database : 'node_app'         // mysql 데이터베이스
};
module.exports = mysql.createPool(connection);