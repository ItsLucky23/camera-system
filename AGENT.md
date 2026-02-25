# Project: Advanced DIY Pan-Tilt Security Camera
## Hardware Component Overview & Pinout Reference

This document serves as a technical reference for an integrated security system featuring motion detection, infrared night vision, two-way audio, and motorized movement.

---

## 1. Core Controllers
### Raspberry Pi Zero 2W
- **Role:** Main processing unit, handling I2S audio streams and potentially hosting a web server/NVR.
- **Key Specs:** Quad-core 64-bit ARM Cortex-A53, 512MB LPDDR2 SDRAM, 2.4GHz Wi-Fi.

### ESP32-CAM (with CAM-MB & Antenna)
- **Role:** Secondary camera node or low-power trigger.
- **Camera:** OV2640 (2MP default) / OV3660 (3MP).
- **Interface:** Includes CH340 USB-to-Serial base (CAM-MB) for easy flashing.
- **Note:** GPIO0 must be grounded to flash; IO4 is connected to the onboard flash LED.

---

## 2. Audio Subsystem (I2S Interface)
### Microphone: INMP441 (MEMS)
High-performance, low-power, digital-output omnidirectional microphone.
- **Protocol:** I2S (Digital, no analog noise).
- **Pinout:**
  - `VDD`: 1.8V to 3.3V
  - `GND`: Ground
  - `L/R`: Left/Right channel select (GND for Left).
  - `SCK`: Serial Data Clock.
  - `SD`: Serial Data Output.
  - `WS`: Word Select (Left/Right clock).

### Speaker & Amplifier: MAX98357A + 3W 40MM Speaker
Class D amplifier that converts I2S to an analog signal for the speaker.
- **Power:** 3W at 4Ω.
- **Interface:** I2S.
- **Setup:** Connect the 3W speaker directly to the screw terminals of the MAX98357A.

---

## 3. Motion & Vision
### PIR Sensor: HC-SR501
- **Type:** Passive Infrared.
- **Voltage:** 5V - 20V (Input), 3.3V (Output Logic).
- **Controls:** Two potentiometers for Sensitivity and Time Delay.
- **Jumper:** Set to 'L' (single trigger) or 'H' (repeatable trigger).

### IR Illuminator: 48 LED 850nm
- **Function:** Provides invisible light for night vision.
- **Requirement:** Requires an external 12V DC power supply (not powered via RPi/ESP32).
- **Sensor:** Built-in CDS light sensor (only turns on when dark).

---

## 4. Actuators (Pan-Tilt)
### Servos: SG90 Micro Servo (5 units)
- **Role:** Controls horizontal (Pan) and vertical (Tilt) movement.
- **Wiring:**
  - **Brown:** GND
  - **Red:** 5V (Caution: Use external power if moving multiple servos).
  - **Orange:** PWM Signal.
- **Range:** ~180 degrees.

---

## 5. Circuit Protection & Prototyping
### Fuses & Holders (M5X20MM)
- **Critical Safety:** Essential when using LiPo batteries or high-current power supplies.
- **Recommendation:** Use a **1A or 2A fuse** for the main 5V line to the Pi/ESP32 to prevent shorts from destroying the boards.

### Starter Kit (Uno R3 based)
- **Jumper Wires:** Use Male-to-Female for connecting sensors to the RPi/ESP32.
- **Breadboard:** For testing the I2S audio circuit before soldering.

---

## 6. Development Strategy
1.  **Phase 1 (Vision):** Flash ESP32-CAM with "CameraWebServer" sketch to verify video stream.
2.  **Phase 2 (Motion):** Connect HC-SR501 to a GPIO to trigger a notification or LED.
3.  **Phase 3 (Pan-Tilt):** Use PWM on the RPi/ESP32 to control two SG90 servos for the camera mount.
4.  **Phase 4 (Audio):** Configure I2S on the RPi Zero 2W to handle the INMP441 (mic) and MAX98357A (speaker) for two-way communication (VOIP).

---
**Warning:** The IR Illuminator requires 12V. Do **not** connect the 12V line to the 5V or 3.3V rails of your microcontrollers.