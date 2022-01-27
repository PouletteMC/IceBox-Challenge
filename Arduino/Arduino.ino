// We Import the libraries that we need

#include <OneWire.h>


const byte ONE_WIRE_BUS = 7;

const int waterPin = A5;

int waterLevel = 0;

const byte SENSOR_ADDRESS_1[] = { 0x28, 0x20, 0xE7, 0x02, 0x00, 0x00, 0x00, 0x24 };
const byte SENSOR_ADDRESS_2[] = { 0x28, 0x46, 0xA3, 0x03, 0x00, 0x00, 0x00, 0x2C };
const byte SENSOR_ADDRESS_3[] = { 0x28, 0xD1, 0xD7, 0x01, 0x00, 0x00, 0x00, 0x6D };

OneWire ds(ONE_WIRE_BUS);

float t1;
float t2;
float t3;

void startTemperatureMeasure(const byte addr[]){
  ds.reset();
  ds.select(addr);
  ds.write(0x44, 1);
}

float readTemperatureMeasure(const byte addr[]) {
  byte data[9];
  ds.reset();
  ds.select(addr);
  ds.write(0xBE);

  for (byte i = 0; i < 9; i++) {
    data[i] = ds.read();
  }
  return (int16_t) ((data[1] << 8) | data[0]) * 0.0625;
}

void setup(){
  Serial.begin(115200);
}


void loop() {
  float temperature[3];
  startTemperatureMeasure(SENSOR_ADDRESS_1);
  startTemperatureMeasure(SENSOR_ADDRESS_2);
  startTemperatureMeasure(SENSOR_ADDRESS_3);
  delay(1000);
  temperature[0] = readTemperatureMeasure(SENSOR_ADDRESS_1);
  temperature[1] = readTemperatureMeasure(SENSOR_ADDRESS_2);
  temperature[2] = readTemperatureMeasure(SENSOR_ADDRESS_3);
  t1 = temperature[0];
  t2 = temperature[1];
  t3 = temperature[2];

  waterLevel = analogRead(waterPin);

  Serial.println(t1 + (String)"|" + t2 + (String)"|" + t3 + (String)"|" + waterLevel);

  delay(298000);
}