'use strict'

var express     = require('express'),
    app         = express(),
    server      = require('http').createServer(app),
    io          = require('socket.io')(server),
    fs          = require('fs'),
    port        = process.env.PORT || 3000,
    request     = require('request'),
    admin       = require("firebase-admin"),
    nstreaming  = 0;

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade')


server.listen(port, function () {
  console.log('Server listening at port %d', port);
});



// -- FIREBASE CONFIGURATION
// Fetch the service account key JSON file contents
var serviceAccount = require("./AndroidVideoStreamingUsers-e8b614f9dcca.json"); //AndroidVideoStreamingUsers-e8b614f9dcca / AndroidVideoStreamingUsers-0104103df27a

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://avsusers.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref('/');

//show database content
ref.once("value", function(snapshot) {
  console.log(snapshot.val());
});

var numstreaming = ref.child("num_streamings");





// -- HTTP
/*app.get('/', (req, res) => {
    res.render('home.jade');
})*/


app.get('/', (req, res) => {
    res.render('index');
})




// -- WEBSOCKET
io.on('connection', function (socket) {

    socket.on('move', function (data) {
        console.log(data)
        socket.broadcast.emit('move', data);
    });

    socket.on('data_streaming', function (data) {
        console.log(data)
        socket.broadcast.emit('streaming_data', data);
    });
});