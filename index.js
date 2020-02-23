var express    = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

var connection = require('./custom_lib/db_connection.js');

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

var memberRouter = require('./routes/member');
app.use('/api/member', memberRouter)
var schdeuleRouter = require('./routes/schedule');
app.use('/api/schedule', schdeuleRouter)
var stadiumRouter = require('./routes/stadium');
app.use('/api/stadium', stadiumRouter)
var attendanceRouter = require('./routes/attendance');
app.use('/api/attendance', attendanceRouter)




  
app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port') + ' http://localhost:3000/');
});