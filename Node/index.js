const SerialPort  = require('serialport');
const ThingSpeakClient = require('thingspeakclient');
const client = new ThingSpeakClient();

let ldr
let gy30

client.attachChannel(1637485, { writeKey:'5NTSJS8JWFXN1FLC'})

const portName = process.argv[2];
let port = new SerialPort(portName, {baudRate: 9600});

let Readline = SerialPort.parsers.Readline;
let parser = new Readline();
port.pipe(parser)

port.on('open', showPortOpen);
parser.on('data', readSerialData);
port.on('close', showPortClose);
port.on('error', showError);


function showPortOpen() {
    console.log('port open. Data rate: ' + port.baudRate);
  }
   
  function readSerialData(data) {

    if(data.startsWith('Light1:')){
      data = data.split(':')
      gy30 = data[1]
    }
    else if(data.startsWith('Light2:')){
      data = data.split(':')
      ldr = data[1]
    }
    else {
      console.log('No light data, check sensors')
    }
    dataHandler(gy30, ldr)
  }
   
  function showPortClose() {
    console.log('port closed.');
    process.exit(0)
  }
   
  function showError(error) {
    console.log('Serial port error: ' + error);
    process.exit(1)
  }
  
  function dataHandler(gy30, ldr){
    let difference = gy30 - ldr
    difference = difference.toString()
    difference = Number(difference.slice(0,4))
    if(difference > 30 || difference < -30){
      console.log(`The difference between the two sensors is ${difference}, there may be something wrong`)
    }
    else {
      console.log(`The difference between the two sensors is ${difference}, uploading data to ThingSpeak`)
      // client.updateChannel(1637485, {field1: gy30, field2: ldr});
    }
  }
