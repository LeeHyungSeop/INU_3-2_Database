`use strict`
const { exec } = require('child_process');
const express = require('express')
const path = require('path')
const static = require('serve-static')
const sqlite3 = require('sqlite3').verbose();
const app = express()

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use('/public', static(path.join(__dirname, 'public'))); // pubilc에 대한 요청에서 현재 디렉토리에 있는 pubilc 디렉토리를 루트 디렉토리로 한다.
console.log('현재 디렉토리 : ' + __dirname);

// main page로 안내
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/main.html')
})
// volunteer's login page로 안내
app.get('/volunteer_login', (req, res) => {
  res.sendFile(__dirname + '/public/volunteer_login.html')
})
// volunteer's signup page로 안내
app.get('/volunteer_signup', (req, res) => {
  res.sendFile(__dirname + '/public/volunteer_signup.html')
})
// wc's login page로 안내
app.get('/wc_register', (req, res) => { 
  res.sendFile(__dirname + '/public/wc_register.html')
})
// volunteer's signup 버튼 눌렸다면
app.post('/process/volunteer_signup', (req, res) => {
  console.log('/process/volunteer_signup 호출됨' +req)

  const paramId = req.body.id
  const paramName = req.body.name
  const paramDOB = req.body.dob
  const paramSchool = req.body.school
  const paramPhoneNum = req.body.pn
  // 받아온 data 출력
  console.log('requested parameters : ' + paramId + ', ' + paramName + ', ' + paramDOB + ', ' + paramSchool + ', ' + paramPhoneNum);
  
  // DB object 생성
  var db = new sqlite3.Database('./OpenAPI_Project_DB/project.db');
  // DB open
  db.run(
    // DB의 VOLUNTEERS 테이블에 새로운 tuple(회원) 추가
    `INSERT INTO VOLUNTEERS (vID, vName, DOB, sName, phoneNum, accumCNT) VALUES (?, ?, ?, ?, ?, ?);`,
    [paramId, paramName, paramDOB, paramSchool, paramPhoneNum, 0],
    function (err) {
        if (err) {
          console.log("SQL Query 실행시 Error.")
          console.dir(err);
          // 이미 존재하는 아이디라면, signup failure page로 안내
          if(err.errno == 19) {
            res.sendFile(__dirname + '/public/volunteer_signup_failure.html');
          }
          return
        }
        if (res) {
          // console.dir(res);
          console.log("회원가입 성공!");
          // 회원가입 성공하면, signup success page로 안내
          res.sendFile(__dirname + '/public/volunteer_signup_success.html');
        }
        else {
          console.log("Inserted Failed");
          res.sendFile(__dirname + '/public/volunteer_signup_failure.html');
        }
    }
  );
  // close the database connection
  db.close();
})

// volunteer's login 버튼 눌렸다면
app.post('/process/volunteer_login', (req, res) => {
  console.log('/process/volunteer_login 호출됨' +req)

  const paramId = req.body.id
  
  // DB object 생성
  var db = new sqlite3.Database('./OpenAPI_Project_DB/project.db');
  // DB open
  db.all(
    // DB의 VOLUNTEERS 테이블에서 id가 일치하는 tuple(회원) 검색
    `SELECT * FROM VOLUNTEERS WHERE vID = ?;`,
    [paramId],
    function (err, rows) {
        console.log("res : " + res);
        if (err) {
          console.log("SQL Query 실행시 Error.")
          console.dir(err);
          return
        }
        if (rows.length > 0) {
          console.log("Login Successed!");
          res.sendFile(__dirname + '/public/volunteer_main.html');
        }
        else {
          console.log("Login Failed");
          res.sendFile(__dirname + '/public/volunteer_login_failure.html');
        }
    }
  );
  // close the database connection
  db.close();
})

// wc's login 버튼 눌렸다면
app.post('/process/wc_login', (req, res) => {
  console.log('/process/wc_login 호출됨' +req)

  const paramId = req.body.id
  
  // DB object 생성
  var db = new sqlite3.Database('./OpenAPI_Project_DB/project.db');
  // DB open
  db.all(
    // DB의 wcS 테이블에서 id가 일치하는 tuple(회원) 검색
    `SELECT * FROM WELFARECENTERS WHERE wcName = ?;`,
    [paramId],
    function (err, rows) {
        console.log("res : " + res);
        if (err) {
          console.log("SQL Query 실행시 Error.")
          console.dir(err);
          return
        }
        if (rows.length > 0) {
          console.log("Login Successed!");
          res.sendFile(__dirname + '/public/wc_main.html');
        }
        else {
          console.log("Login Failed");
          res.sendFile(__dirname + '/public/wc_login_failure.html');
        }
    }
  );
  // close the database connection
  db.close();
})

// service 등록 버튼 눌렸다면
app.post('/process/wc_register', (req, res) => {
  console.log('/process/wc_register 호출됨' +req)

  const param_wcName = req.body.wcName
  const param_olderName = req.body.olderName
  const param_olderPN = req.body.olderPN
  const param_sDescribe = req.body.sDescribe
  // 받아온 data 출력
  console.log('requested parameters : ' + param_wcName + ', ' + param_olderName + ', ' + param_olderPN + ', ' + param_sDescribe);
  
  // DB object 생성
  var db = new sqlite3.Database('./OpenAPI_Project_DB/project.db');
  // DB open
  db.all(
    // DB의 WELFARCENTERS 테이블에 param_wcName이 일치하는 wcName가 있는지 확인
    `SELECT * FROM WELFARECENTERS WHERE wcName = ?;`,
    [param_wcName],
    function (err, rows) {
      console.log("res : " + res);
      if (err) {
        console.log("SQL Query 실행시 Error.")
        console.dir(err);
        return
      }
      if (rows.length > 0) {
        console.log("wcName이 존재합니다.");
        // DB의 SERVICES 테이블에 새로운 service(공고) 추가
        db.all(
          `INSERT INTO SERVICES (sNum, vName, vPhoneNum, isFinish, isAssign, wcName, vID, sDescribe) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          // sNum은 primary key이므로 자동으로 증가하게끔 설정
          [null, param_olderName, param_olderPN, 0, 0, param_wcName, null, param_sDescribe],
          function (reg_err) {
            if (reg_err) {
              console.log("SQL Query 실행시 Error.")
              console.dir(reg_err);
              res.sendFile(__dirname + '/public/wc_register_failure.html');
              
              return
            }
            if (res) {
              // console.dir(res);
              console.log("Register Success!");
              // 공고 등록이 성공하면, wc register success page로 안내
              res.sendFile(__dirname + '/public/wc_register_success.html');
            }
            else {
              console.log("Inserted Failed");
              res.sendFile(__dirname + '/public/wc_register_failure.html');
            }
          }
        )
      }
      else{
        console.log("wcName이 존재하지 않습니다.");
        res.sendFile(__dirname + '/public/wc_register_failure.html');
      }
    }
  );
  // close the database connection
  db.close();
})

// volunteer_main.html에서 보낸 노인복지회관에 대한 공고들을 return
app.get('/process/find_services', (req, res) => {
  console.log('/process/find_services 호출됨' +req)
  // 작성해야 함

});

app.listen(5500, () => {
  console.log('listening on port 5500')
})