
// Import the libraries we will use
const SerialPort  = require('serialport');
const ThingSpeakClient = require('thingspeakclient');
const axios = require('axios');


// Create a new instance of the SerialPort class
const client = new ThingSpeakClient();
const url = 'https://op-dev.icam.fr/~icebox/'

// Declare our variables on the global scope  
let IceCube
let IceBox
let Outside
let Water
let time
// let firstDetect = false

// Give the thingspeak library our write key and channel ID
client.attachChannel(1637485, { writeKey:'5NTSJS8JWFXN1FLC'})

// Get the arduino's serial port from the start command
const portName = process.argv[2];

// Create a new instance of the SerialPort class with a baudrate of 115200
let port = new SerialPort(portName, {baudRate: 115200});
 
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
  data = data.split('|')
  IceCube = data[0]
  IceBox = data[1]
  Outside = data[2]
  Water = data[3]
  dataHandler(IceCube, IceBox, Outside, Water)
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
function dataHandler(cube, box, out, water) {
  console.log(`Temperature1: ${cube}`)
  console.log(`Temperature2: ${box}`)
  console.log(`Temperature3: ${out}`)
  console.log(`Water: ${water}`)
  time = prediction(cube, out)
  console.log(`Prediction: ${time}`)
  sendData(time)
  client.updateChannel(1637485, { field3: cube, field4: box, field5: out, field6: water, field7: time });
}

function prediction(cube, out){
  let time = (680)/(1.19*(out-(cube)))
  let timeSeconds = time*3600
  let timeString = timeSeconds.toString()
  let timeFinal = Number(timeString.slice(0,6))
  return timeFinal
}

function sendData(time) {
  axios.get(`https://op-dev.icam.fr/~icebox/createPrediction.php`, {
    params: {
      prediction: time,
      idexperience: '71',
      secretkey: 'fcac'
    }
  }).then(response => {
    console.log(response.data)
  }).catch(error => {
    console.log(error.data)
  })
}

// function sleep(time) {
//   return new Promise((resolve) => setTimeout(resolve, time));
// }

// function detectWater(waterLevel){
//   if(firstDetect == false && waterLevel > 10) {
//     firstDetect = true
//     axios.get(`https://op-dev.icam.fr/~icebox/changeExperienceStatus.php`, {
//       params: {
//         idexperience: '71',
//         secretkey: 'fcac',
//         newStatus: '1'
//       }
//     })
//   } else if(firstDetect == true && waterLevel < 10) { 
//     firstDetect = false
//     axios.get(`https://op-dev.icam.fr/~icebox/changeExperienceStatus.php`, {
//       params: {
//         idexperience: '71',
//         secretkey: 'fcac',
//         newStatus: '2'
//       }
//     })
//   } else {
//     console.log('No change')
//   }
// }