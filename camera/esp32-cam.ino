#include <WiFi.h>
#include <WebSocketsClient.h>
#include "esp_camera.h"

// Replace with your WiFi credentials
const char* ssid = "PMBM";
const char* password = "vq6DytxzLthj";

// WebSocket Server IP and Port
const char* websocket_host = "192.168.178.248";  // your Node.js server IP
const uint16_t websocket_port = 8090;

WebSocketsClient webSocket;

bool streaming = false;
unsigned long lastFrameTime = 0;
const unsigned long frameInterval = 100;  // 10 fps
bool cameraInitialized = false;

void stopCamera() {
  if (cameraInitialized) {
    esp_camera_deinit();
    cameraInitialized = false;
  }
}

void setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = 5;
  config.pin_d1 = 18;
  config.pin_d2 = 19;
  config.pin_d3 = 21;
  config.pin_d4 = 36;
  config.pin_d5 = 39;
  config.pin_d6 = 34;
  config.pin_d7 = 35;
  config.pin_xclk = 0;
  config.pin_pclk = 22;
  config.pin_vsync = 25;
  config.pin_href = 23;
  config.pin_sscb_sda = 26;
  config.pin_sscb_scl = 27;
  config.pin_pwdn = 32;
  config.pin_reset = -1;
  config.xclk_freq_hz = 10000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
// Frame Size	Resolution
// FRAMESIZE_QQVGA	160x120
// FRAMESIZE_QVGA	320x240
// FRAMESIZE_VGA	640x480
// FRAMESIZE_SVGA	800x600
// FRAMESIZE_XGA	1024x768
// FRAMESIZE_SXGA	1280x1024
// FRAMESIZE_UXGA	1600x1200

  if (psramFound()) {
    config.frame_size = FRAMESIZE_QVGA;
    config.jpeg_quality = 20;
    config.fb_count = 1;
  } else {
    config.frame_size = FRAMESIZE_QVGA;
    config.jpeg_quality = 24;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  delay(500);  // wait for sensor to stabilize
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    cameraInitialized = false;
    return;
  }
  cameraInitialized = true;
}

void onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("WebSocket Connected");
      webSocket.sendTXT("{\"socketType\":\"esp32\"}");
      break;

    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected");
      streaming = false;
      stopCamera();
      break;

    case WStype_TEXT: {
      String msg = String((char*)payload);
      Serial.printf("Received: %s\n", msg.c_str());

      if (msg.indexOf("\"request\":\"captureVideo\"") >= 0) {
        Serial.println("Starting video stream...");
        if (!cameraInitialized) {
          setupCamera();
        }
        if (cameraInitialized) {
          streaming = true;
        }
      } else if (msg.indexOf("\"request\":\"stopVideo\"") >= 0) {
        Serial.println("Stopping video stream...");
        streaming = false;
        stopCamera();
      }
      break;
    }

    default:
      break;
  }
}


void streamFrame() {
  if (millis() - lastFrameTime >= frameInterval) {
    lastFrameTime = millis();
    camera_fb_t* fb = esp_camera_fb_get();
    if (fb) {
      webSocket.sendBIN(fb->buf, fb->len);
      esp_camera_fb_return(fb);
    } else {
      Serial.println("Camera frame failed — possibly not initialized or out of memory.");
    }
  }
}


void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  WiFi.setSleep(true);
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  webSocket.begin(websocket_host, websocket_port, "/");
  webSocket.onEvent(onWebSocketEvent);
  webSocket.setReconnectInterval(5000);  // Try to reconnect every 5 seconds
}

void loop() {
  webSocket.loop();

  if (streaming && webSocket.isConnected() && cameraInitialized) {
    streamFrame();
  } else {
    delay(2);
  }
}
