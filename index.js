var Net = require('net');
var serialport = require("serialport")

var SERIAL_PORT = "/dev/ttyACM0"
var BAUDRATE = 115200

var HOST = '0.0.0.0';
var PORT = 8080;

var remoteSock = undefined;

var serialPort = new serialport.SerialPort(SERIAL_PORT, {
  baudrate: BAUDRATE,
  parser: serialport.parsers.readline("\n")
}, false);

serialPort.open(function (error) {
  if(error) {
    console.log('Serial Port failed to open: ' + error);
  }
  else {
    console.log('Serial Port listening on ' + SERIAL_PORT + ':' + BAUDRATE);
    serialPort.on('data', function(data) {
      console.log('Serial Port data received: ' + data);
      remoteSock.write(results);
    });
  }
});

Net.createServer(function(sock) {
  console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
  remoteSock = sock;
  sock.on('data', function(data) {
    console.log('DATA ' + sock.remoteAddress + ': ' + data);
    serialPort.write(data, function(err, results) {
      console.log('Serial Port results ' + results);
    });
  });

  sock.on('close', function(data) {
    console.log('CLOSED: ' + sock.remoteAddress + ':'+ sock.remotePort);
  });

}).listen(PORT, HOST);

console.log('Wifi Socket listening on ' + HOST +':'+ PORT);