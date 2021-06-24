var express = require('express');
const https = require('https');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
// const PORT = rpcess.env.PORT || 443;

var connection = require('./custom_lib/db_connection.js');

var app = express();
// 주석 추가
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());

// configuration ===============================================================
app.set('port', process.env.PORT || 80);
// app.set('port', process.env.PORT || 443);
// https.createServer(app).listen(PORT);

app.get('/', function (req, res, next) {
  res.send('Root');
});

var memberRouter = require('./routes/member');
app.use('/api/member', memberRouter)
var schdeuleRouter = require('./routes/schedule');
app.use('/api/schedule', schdeuleRouter)
var stadiumRouter = require('./routes/stadium');
app.use('/api/stadium', stadiumRouter)
var attendRouter = require('./routes/attend');
app.use('/api/attend', attendRouter)

var gameRouter = require('./routes/game');
app.use('/api/game', gameRouter)

var squadRouter = require('./routes/squad');
app.use('/api/squad', squadRouter)
var teamSplitRouter = require('./routes/teamSplit');
app.use('/api/teamSplit', teamSplitRouter)
var team = require('./routes/team');
app.use('/api/team', team)
var unitTeam = require('./routes/unitTeam');
app.use('/api/unitTeam', unitTeam)
var unitMember = require('./routes/unitMember');
app.use('/api/unitMember', unitMember)
var memberSquadRouter = require('./routes/memberSquad');
app.use('/api/memberSquad', memberSquadRouter)
var gameReportRouter = require('./routes/gameReport');
app.use('/api/gameReport', gameReportRouter)
var memberRankingRouter = require('./routes/ranking');
app.use('/api/ranking', memberRankingRouter)

var userRouter = require('./routes/user');
app.use('/api/user', userRouter)
var userHistoryRouter = require('./routes/userHistory');
app.use('/api/userHistory', userHistoryRouter)


app.use(logHandler);
app.use(errorHandler);

// logger middleware
function logHandler(err, req, res, next) {
  console.error('[' + new Date() + ']\n' + err.stack);
  next(err);
}

// error handler middleware
function errorHandler(err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message || 'Error!!');
}



app.listen(app.get('port'), function () {
  // console.log('Express server listening on port ' + app.get('port') + ' http://localhost:3000/');
  console.log('Express server listening on port ' + app.get('port') + ' https://nnnn-api.code2world.xyz/');
});
