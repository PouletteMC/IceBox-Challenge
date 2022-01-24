#include <Wire.h>
#include <BH1750.h>

BH1750 GY30; // instantiate a sensor event object
int LDR_PIN = A0;


void setup(){
  Serial.begin(9600); // launch the serial monitor
  Wire.begin(); // Initialize the I2C bus for use by the BH1750 library  
  GY30.begin(); // Initialize the sensor object
  Serial.println("Flux Workshop Example");
}
void loop() {
  int lux = GY30.readLightLevel(); // read the light level from the sensor and store it in a variable

  const double k = 5.0/1024;
  const double luxfactor = 50000;
  const double R2 = 100000;
  const double LowLightLimit = 200;
  const double B = 1.3*pow(10.0,7);
  const double m = -1.4;
  int ldr = analogRead(LDR_PIN);

  double V2 = k*ldr;
  double R1 = (5.0/V2 - 1)*R2;
  double lux2 = B*pow(R1,m);

  Serial.println((String)"Light1:" + lux); // print the data to the serial monitor
  Serial.println((String)"Light2:" + lux2);  
  delay(1000); // Pause for a second before repeating the sensor poll
}
