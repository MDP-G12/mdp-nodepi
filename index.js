var Net = require('net');
var serialport = require("serialport")

var SERIAL_PORT = "/dev/ttyACM0"
var BAUDRATE = 115200

var HOST = '0.0.0.0';
var PORT = process.env.PORT || 8080;

var remoteSocks = [];

var serialPort = new serialport.SerialPort(SERIAL_PORT, {
  baudrate: BAUDRATE,
  parser: serialport.parsers.readline("\n")
}, false);

serialPort.open(function (error) {
  if(error) {
    console.log('SERIAL failed to open: ' + error);
  }
  else {
    console.log('SERIAL listening on ' + SERIAL_PORT + ':' + BAUDRATE);
    serialPort.on('data', function(data) {
      data = data.toString().trim().replace(/(\r\n|\n|\r)/gm,"");
      console.log('SERIAL Data: ' + data);
      for(var i = 0; i < remoteSocks.length; i++) {
        remoteSocks[i].write(data+"\n");
      }
    });
  }
});

Net.createServer(function(sock) {
  console.log('SOCK CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
  remoteSocks.push(sock);

  sock.on('data', function(data) {
    data = data.toString().trim().replace(/(\r\n|\n|\r)/gm,"");
    console.log('SOCK DATA ' + sock.remoteAddress + ': ' + data);

    if(data.indexOf("AND") > -1) {
      for(var i = 0; i < remoteSocks.length; i++) {
        remoteSocks[i].write(data+"\n");
      }
    }
    else {
      serialPort.write(data, function(err, results) {});
    }
  });

  sock.on('close', function(data) {
    console.log('SOCK CLOSED: ' + sock.remoteAddress + ':'+ sock.remotePort);
  });

}).listen(PORT, HOST);

console.log('SOCK listening on ' + HOST +':'+ PORT);