var express    = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

var mysql      = require('mysql');
var dbconfig   = require('./config/database.js');
var connection = mysql.createConnection(dbconfig);

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// configuration ===============================================================
app.set('port', process.env.PORT || 3000);

app.get('/', function(req, res){
    res.send('Root');
});

app.get('/member', function(req, res){

  connection.query('SELECT * from member', function(err, rows) {
    if(err) throw err;

    console.log('The solution is: ', rows);
    res.send(rows);
  });
});

var memberRouter = require('./routes/member');
app.use('/api/member', memberRouter)


  
app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});