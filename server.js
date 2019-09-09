const express = require("express");
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname+"/public"));
app.set("views", __dirname+"/public/views");
app.set("view engine", "pug");

// Test code for no connection to Database. 
app.get('/', (req, res) => {
    res.render('index');
});

// DB Connection
const db_connection = mysql.createConnection({
    host: "aa1emmlru4ealo0.cfrds4g1yqyo.ap-northeast-2.rds.amazonaws.com",
    // host: "localhost",
    user: "root",
    password: "good5135",
    database: "rhythmGame_data",
});


var sql;



// DB Connection
db_connection.connect(function(err){
	if (err) throw err;
    console.log('DB Connected!')
});

// POST 'user' and link to game page
app.post('/', function(req, res){
    class User {
        constructor(userName, score, bestScore, recordDate) {
            this.userName = userName;
            this.score = score;
            this.bestScore = bestScore;
            this.recordDate = recordDate;
        }
    }

    var users = [];

    var userName = req.body.userName;

    if(!userName){
        res.render("index", {notice:"Write userName!!"});
    }
    else{
        sql = `SELECT * FROM score_data;`;
        db_connection.query(sql, function(err, results, fields){
            if(err) throw err;
            
            results.forEach(element => {
                var user = new User(element.userName, element.score, element.bestScore, element.recordDate);
                users.push(user);
            });
            
            res.render('game', {users: users, userName: userName});
        });
    }
});

app.post('/result', function(req, res){
    sql = `UPDATE score_data SET bestScore=0 WHERE bestScore=1;`;
    db_connection.query(sql, function(err, results, fields){
        if(err) throw err;
        sql = `INSERT INTO score_data(userName, score, bestScore, recordDate) values('${req.body.userName}', ${req.body.score}, ${req.body.bestScore}, now());`;
        db_connection.query(sql, function(err, results, fields){
            if(err) throw err;
        })
    })
})

app.listen(8081, ()=>{
    console.log("8081 Port : Server is running...");
})