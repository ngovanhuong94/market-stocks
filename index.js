var express = require('express');
var app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var yahooFinance = require('yahoo-finance');
var moment = require('moment');
var dateFormat = require('dateformat')

var stocks = ['FB'];
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use('/', require('./routes/router.index'));
app.use(express.static('public'));
app.get('/api/infostock', function(req,res){
	var names = req.query.names.split(',');
	
	
	// var toDate = DateNow.getFullYear()+'-'+DateNow.getMonth()+'-'+DateNow.getDate();  
	// console.log(toDate)
   var threeMonthsAgo = moment().subtract(3, 'months');

 // console.log(threeMonthsAgo.toISOString().slice(0, 10));
 //    console.log(new Date().toISOString().slice(0, 10));
	yahooFinance.historical({
		symbols: names,
		from: threeMonthsAgo.toISOString().slice(0, 10),
   	to: new Date().toISOString().slice(0, 10)
   }, function(err,quotes){
   	res.json(quotes)
   })
	
})

io.on('connection', function(socket){
	console.log('a user connected');
	socket.emit('init', stocks);
	socket.on('add stock', function(name){
	 stocks.push(name);
	 io.emit('init', stocks)
	})

	socket.on('remove stock', function(id){
		stocks.splice(id,1)
	  io.emit('init', stocks)	
	})
})

http.listen(process.env.PORT || 3000, () => console.log('Server is running'))