'use strict'

var express      = require('express'),
    app          = express(),
    server       = require('http').createServer(app),
    io           = require('socket.io')(server),
    fs           = require('fs'),
    port         = process.env.PORT || 3000,
    request      = require('request'),
    admin        = require("firebase-admin"),
    device_id    = null,
    device_name  = null,
    numstreaming = 0;


app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade')


server.listen(port, function () {
  console.log('Server listening at port %d', port);
});


app.get('/', (req, res) => {
    res.render('index');
})



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




// -- WEBSOCKET
io.on('connection', function (socket) {

    //show database content
    console.log("\nFirebase data:\nnum_s" + "   " + "device_id" + "          " + "device_name");
    ref.on("value", function(snapshot) {
        //console.log(snapshot.val());

        snapshot.forEach(function (devices_data) {
            devices_data.forEach(function (android_id) {
                device_id   = android_id.val().deviceId;
                device_name = android_id.val().deviceName;
            });
        });
        
        numstreaming = snapshot.val().num_streamings;
        console.log(numstreaming + "       " + device_id + "   " + device_name + "\n");

        socket.broadcast.emit('data_streaming',{'num_streamings': numstreaming, 'device_id': device_id, 'device_name': device_name});
    });
    
});
