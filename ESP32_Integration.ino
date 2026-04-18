#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <SparkFun_AS7343.h> // Ensure this library is installed
#include <Adafruit_MLX90614.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// --- WiFi Credentials ---
const char* ssid = "atl";
const char* password = "harshil913";

// --- Supabase Config ---
const char* supabaseUrl = "https://vntaprmahmjeyuzhwqsc.supabase.co/rest/v1/readings"; 
const char* supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudGFwcm1haG1qZXl1emh3cXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjY3NDMsImV4cCI6MjA5MTA0Mjc0M30.K3NE7-bRaYRRRhV9Up2Y7f4mVoRvM3B0_dNMitJT_S8";

// --- Hardware Objects ---
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
Adafruit_MLX90614 mlx = Adafruit_MLX90614();
SfeAS7343ArdI2C spectralSensor;

uint16_t spectralData[ksfAS7343NumChannels]; // Array for 14+ channels

// Approximate wavelengths in nm for the AS7343 channels (ordered by index)
// Typical 14 channel map: FZ(425), FY(475), FX(525), F8(600), NIR(850)...
// (We will use this to calculate dominant wavelength)
const int channelWavelengths[] = {425, 475, 525, 550, 600, 650, 700, 750, 800, 850, 400, 450, 500, 550};

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // AS7343 & MLX share these pins

  // 1. WiFi Connection
  WiFi.begin(ssid, password);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");

  // 2. OLED Init
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) Serial.println("OLED Failed");
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // 3. Temperature Sensor Init
  if (!mlx.begin()) Serial.println("MLX90614: Not Found!");

  // 4. Spectral Sensor Init
  if (spectralSensor.begin() == false) {
    Serial.println("AS7343: Not Found!");
  } else {
    spectralSensor.powerOn();
    Serial.println("AS7343: Ready.");
  }
}

void loop() {
  // --- 1. Read Temperature ---
  float objC = mlx.readObjectTempC();
  
  // --- 2. Read Spectral Data (14 Channels) ---
  spectralSensor.ledOn();
  delay(200); // Wait for sensor to stabilize
  if (spectralSensor.readSpectraDataFromSensor()) {
    spectralSensor.getData(spectralData);
  }
  spectralSensor.ledOff();

  // Find Dominant Wavelength (Channel with highest intensity)
  uint16_t maxIntensity = 0;
  int peakChannel = 0;
  for(int i = 0; i < 14; i++) {
    if(spectralData[i] > maxIntensity) {
      maxIntensity = spectralData[i];
      peakChannel = i;
    }
  }
  float dominantWavelength = channelWavelengths[peakChannel % 14];

  // --- 3. Send to Supabase ---
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(supabaseUrl);
    
    http.addHeader("Content-Type", "application/json");
    // VERY IMPORTANT for Supabase REST POST (fixes schema tracking)
    http.addHeader("Prefer", "return=minimal"); 
    http.addHeader("apikey", supabaseKey);
    http.addHeader("Authorization", "Bearer " + String(supabaseKey));

    // Construct JSON Body
    String jsonPayload = "{";
    jsonPayload += "\"temperature\":" + String(objC) + ",";
    
    // Send the absolute dominant wavelength so the frontend shows a single number (e.g. 525nm)
    jsonPayload += "\"wavelength\":" + String(dominantWavelength) + ",";
    
    // Store all 14 channels raw data safely as a proper JSON array, not a comma-separated string!
    // Ex: "spectral_channels": [100, 150, 120, ...]
    jsonPayload += "\"spectral_data\":[";
    for(int i = 0; i < 14; i++) {
      jsonPayload += String(spectralData[i]) + (i == 13 ? "" : ",");
    }
    jsonPayload += "]";
    jsonPayload += "}";
    
    int httpResponseCode = http.POST(jsonPayload);

    // Debugging
    Serial.print("Supabase Response: "); Serial.println(httpResponseCode);
    if (httpResponseCode != 201 && httpResponseCode != 204) {
      String response = http.getString();
      Serial.println("Error Detail: " + response);
    }
    http.end();
  }

  // --- 4. OLED Update ---
  display.clearDisplay();
  display.setCursor(0,0);
  display.setTextSize(1);
  display.println("CLOUD SYNC ACTIVE");
  display.printf("Temp: %.2f C\n", objC);
  display.printf("Peak Wlen: %.0f nm\n", dominantWavelength);
  display.println("Spec (1-4):");
  for(int i = 0; i < 4; i++) {
    display.print(spectralData[i]); display.print(" ");
  }
  display.display();

  delay(5000); 
}
