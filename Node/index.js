
// Import the libraries we will use
const SerialPort  = require('serialport');
const ThingSpeakClient = require('thingspeakclient');

// Create a new instance of the SerialPort class
const client = new ThingSpeakClient();

// Declare our variables on the global scope
let ldr
let gy30

// Give the thingspeak library our write key and channel ID
client.attachChannel(1637485, { writeKey:'5NTSJS8JWFXN1FLC'})

// Get the arduino's serial port from the start command
const portName = process.argv[2];

// Create a new instance of the SerialPort class with a baudrate of 9600
let port = new SerialPort(portName, {baudRate: 9600});
 
let Readline = SerialPort.parsers.Readline;
// Listen for the data event
let parser = new Readline();
port.pipe(parser)

// Listen for the serial port to be opened
port.on('open', showPortOpen);
// When data is received, run it through the readSerialData function
parser.on('data', readSerialData);
// Listen for the serial port to be closed
port.on('close', showPortClose);
// Listen for errors
port.on('error', showError);

// When the port opens, print a message along with the baudrate
function showPortOpen() {
  console.log('port open. Data rate: ' + port.baudRate);
}

// What to do when we receive data
function readSerialData(data) {

  // Split the data into an array of strings if it starts with 'Light1:'
  if(data.startsWith('Light1:')){
    data = data.split(':')
    gy30 = data[1]
  } //If the data starts with 'Light2:' we do something else
  else if(data.startsWith('Light2:')){
    data = data.split(':')
    ldr = data[1]
  } // If the data doesn't abide by the above rules, we tell the user nothing was received
  else {
    console.log('No light data, check sensors')
  }
  // We run the dataHandler function with the data we received
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

// This function is called when we receive data and handles the logic
function dataHandler(gy30, ldr){
  // Calculate the difference between the two sensor's data to rule out noise and outliers
  let difference = gy30 - ldr
  // A bit of JS trickery to trim the result
  difference = difference.toString()
  difference = Number(difference.slice(0,4))
  // We decided on 30 as the cutoff since similar data was always within this range
  if(difference > 30 || difference < -30){
    // If the difference is outside of the range, we tell the user that the data is bad and do nothing
    console.log(`The difference between the two sensors is ${difference}, there may be something wrong`)
  }
  else {
    // If the data is believable, we tell the user and send the data over to ThingSpeak
    console.log(`The difference between the two sensors is ${difference}, uploading data to ThingSpeak`)
    client.updateChannel(1637485, {field1: gy30, field2: ldr});
  }
}
