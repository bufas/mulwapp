var fs = require('fs');

// Check that a folder has been given as parameter
if (process.argv.length != 3) {
  console.log('Please tell me which example to serve.');
  process.exit();
}

var folderToServe = __dirname + '/../'+process.argv[2];
if (!fs.existsSync(folderToServe)) {
  console.log('The folder ' + process.argv[2] + ' does not exist.');
  process.exit();
}

var connect = require('connect'),
    sharejs = require('share').server;

var server = connect(
    // connect.logger(),
    connect.static(folderToServe)
);
var options = {db: {type: 'none'}}; // See docs for options. {type: 'redis'} to enable persistance.

// Attach the sharejs REST and Socket.io interfaces to the server
sharejs.attach(server, options);

server.listen(8000, function(){
    console.log('Server running at http://127.0.0.1:8000/');
    console.log('Serving ' + folderToServe)
});
