# V.I.S.I.O.N. – Vital Independence System for Individuals with Outstanding Needs

> **First prototype (Screening Version) presented at Event Expo Screening.**

A research accessibility prototype that enables hands-free computer control using head tracking and facial gestures. Built for people with limited or no use of their hands/arms.

---

## Current Features
- **Real-time head tracking → mouse movement** (optical flow based)
- **Facial Action Words** (wink, blink, eyebrow raise, mouth open/close, head tilt, etc.)
- **Dwell clicking + gesture-based clicking**
- **Live face mesh visualization**
- **Adjustable sensitivity, smoothing, and click modes**
- **Single-screen research prototype UI**

> **Note:** This is an early screening prototype. Core tracking works reliably, but the codebase still contains rough edges and temporary solutions.

---

## Quick Start & Run Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- Webcam connected and centered in front of the user with adequate ambient lighting

### Installation
```bash
# Clone the repository
git clone https://github.com/arjavnotfound/VISION-Research-Prototype.git
cd VISION-Research-Prototype

# Install dependencies across all packages
npm run install-all
```

### Running the Desktop Application (Electron)
```bash
# Launch the desktop app
npm start
# or
npm run desktop
```
On Windows, you can also launch directly via `run-desktop.bat` or `start.bat`.

### Running the Web Version
```bash
# Launch the browser demo server
npm run website
```

---

## Interaction Profiles & Controls

- **F9**: Global toggle to start/pause tracking and dwell clicking.
- **Dwell Click**: Hold cursor steady over any element to trigger an automatic click.
- **Wink Control Profile**:
  - Left Wink: Left click / drag
  - Right Wink: Right click
- **Mouth & Head Profile**:
  - Jaw drop / Mouth open: Primary click / drag
  - Mouth open + Head tilt up/down: Scroll up / down
- **Universal Accessibility Shortcuts**:
  - **Eyebrow Raise (Hold 3s)**: Launches On-Screen Keyboard (`osk.exe` on Windows).
  - **Close Both Eyes (Hold 2s)**: Toggle Standby / Sleep mode.

---

## Project Structure
- `desktop-app/`: Electron desktop application for system-wide hands-free mouse control.
- `core/`: Core computer vision, optical flow tracking, and facial gesture detection engine.
- `website/`: Browser-based demonstration and standalone web interface.
