# V.I.S.I.O.N. — Engineering Roadmap & Priority Matrix

This roadmap establishes a rigorous, phased engineering sequence to evolve the **V.I.S.I.O.N.** prototype into a stable, calibrated, testable, benchmarked, robust, accessible, and research-grade hands-free interaction platform.

---

## 1. Priority Ranking Schema

- **P0 — CRITICAL (Immediate Safety & Stability Fixes)**: Must be resolved before any experimental deployment or user trials. Prevents crashes, OS input lockups, and privacy leaks.
- **P1 — HIGH PRIORITY (Core Robustness & Quality Foundation)**: Automated testing harnesses, calibration workflows, gesture accuracy, and memory leak mitigation.
- **P2 — USEFUL (Architecture, Benchmarking & UX)**: Systematic performance measurement, modularization of monolithic files, and accessible HUD redesign.
- **P3 — FUTURE (Advanced Research & Expansion)**: Multi-camera fusion, 3D canonical head modeling, and machine-learning gesture classification.

---

## 2. Ranked Action Items

### P0 — CRITICAL

| ID | Item | Primary Component | Phase Alignment | Rationale |
|:---|:---|:---|:---|:---|
| **P0-1** | **Fix Scoping Bug in `scrollMouse`** | `desktop-app/src/electron-main/electron-main.js` | **Phase 1** | Resolves fatal `ReferenceError: isClickingAllowed is not defined` when tilting head with mouth open. |
| **P0-2** | **Implement Failsafe Native Mouse Release** | `desktop-app/src/electron-main/electron-main.js` | **Phase 1** | Guarantees that OS `mouseUp` is dispatched when tracking is paused, physical mouse is moved, or app exits, eliminating stuck mouse buttons. |
| **P0-3** | **Deactivate Upstream Telemetry (Sentry DSN)** | `desktop-app/src/electron-main/electron-main.js` | **Phase 1 / 9** | Stops transmission of system crash dumps and diagnostic logs to third-party endpoints. |
| **P0-4** | **Formalize Native Input Fallback Driver** | `desktop-app/src/electron-main/input-driver.js` | **Phase 1** | Integrate the Koffi Win32 FFI driver cleanly with error boundary fallbacks so installations without C++ compilers run reliably. |
| **P0-5** | **Eliminate Camera Acquisition Race Condition** | `core/vision.js` | **Phase 1** | Add abort controllers and state gating to `useCamera()` to prevent unclosed `MediaStream` tracks and camera lockups. |

---

### P1 — HIGH PRIORITY

| ID | Item | Primary Component | Phase Alignment | Rationale |
|:---|:---|:---|:---|:---|
| **P1-1** | **Automated Testing Foundation** | `core/`, `desktop-app/` | **Phase 2** | Install a lightweight test runner (e.g. Vitest/Mocha) with unit tests for 1€ Filter, EAR/MAR calculation, and IPC mocks. |
| **P1-2** | **Interactive Calibration Wizard** | `core/vision.js`, UI | **Phase 3** | Replace arbitrary manual angle sliders with a guided calibration sequence (neutral center, max left/right yaw, max up/down pitch). |
| **P1-3** | **Eliminate O(N²) Allocations in Point Tracking** | `core/vision.js` (`class OOPS`) | **Phase 4 / 10** | Replace per-frame string concatenation and array filtering in `prunePoints()` with typed arrays or spatial grid bins. |
| **P1-4** | **Coalesce High-Frequency Overlay IPC & DOM Updates** | `desktop-app/src/electron-main/electron-main.js` | **Phase 4 / 10** | Throttle `monitorMousePosition` from 100 Hz to requestAnimationFrame/state-driven updates, caching radial gradient masks. |
| **P1-5** | **Enable OS-Level Desktop Dwell Dragging** | `desktop-app/src/screen-overlay.js` | **Phase 4** | Implement `shouldDrag` and `isHeld` handlers on the transparent desktop overlay to empower hands-free dragging in Windows. |
| **P1-6** | **Lighting & Camera Distance Diagnostics** | `core/vision.js` | **Phase 4** | Provide user-visible feedback when ambient lighting is insufficient or the face is positioned too close/far from the sensor. |

---

### P2 — USEFUL

| ID | Item | Primary Component | Phase Alignment | Rationale |
|:---|:---|:---|:---|:---|
| **P2-1** | **Standardized Benchmark Harness** | `scripts/benchmarks/` | **Phase 5** | Create automated measurement of end-to-end latency (camera capture timestamp to native `SetCursorPos`), FPS stability, and CPU load. |
| **P2-2** | **Fitts' Law Hands-Free Evaluation Protocol** | `website/` / `core/` | **Phase 6** | Implement standardized ISO 9241-9 pointing evaluation tasks to produce peer-reviewed empirical throughput data. |
| **P2-3** | **Accessible Dashboard & HUD Redesign** | `desktop-app/src/`, `core/` | **Phase 7** | Modernize the visual styling, high-contrast indicators, gesture meters, and visual fatigue reduction mechanisms. |
| **P2-4** | **Modularize `core/vision.js`** | `core/src/` | **Phase 8** | Decompose the 5,139-line monolith into cohesive ES modules (`tracking/`, `gestures/`, `filters/`, `overlay/`, `settings/`). |
| **P2-5** | **Attribution & Project Identity Alignment** | Whole Repository | **Phase 9** | Clarify third-party licenses (MIT attribution for upstream components) while standardizing V.I.S.I.O.N. metadata and URLs. |

---

### P3 — FUTURE

| ID | Item | Primary Component | Phase Alignment | Rationale |
|:---|:---|:---|:---|:---|
| **P3-1** | **Multi-Camera / Mirror Stereo Fusion** | `core/` | **Phase 11** | Average facial landmarks from dual webcams to eliminate tracking loss during steep head rotations. |
| **P3-2** | **3D Canonical Face Pose Modeling** | `core/` | **Phase 11** | Project facial keypoints into head-relative canonical space so wink/blink EAR detection becomes invariant to extreme head tilt. |
| **P3-3** | **Custom Action Word Training Integration** | `website/trainer/` | **Phase 11** | Integrate lightweight on-device classifier models to detect user-specific gestures (e.g. tongue movement, slight jaw clenches). |

---

## 3. Phased Execution Roadmap

```
PHASE 0: Complete Repository Audit (CURRENT — COMPLETE)
  │
  ▼
PHASE 1: Safety + Stability
  ├── Fix isClickingAllowed scoping in scrollMouse
  ├── Implement failsafe mouse button release
  ├── Disable external Sentry telemetry
  ├── Formalize Koffi Win32 driver fallback
  └── Resolve useCamera race conditions
  │
  ▼
PHASE 2: Automated Testing Foundation
  ├── Configure unit test framework
  ├── Unit tests: 1€ Filter, EAR, MAR, Brow geometry
  └── Integration test: IPC message schemas
  │
  ▼
PHASE 3: Calibration
  ├── Guided calibration workflow (Center, Range, Limits)
  └── User baseline persistence & sensitivity normalization
  │
  ▼
PHASE 4: Gesture + Cursor Robustness
  ├── Optimize O(N²) point tracking allocations
  ├── Desktop dwell drag-and-drop
  └── Lighting/distance environmental checks
  │
  ▼
PHASE 5: Benchmarking
  ├── Latency pipeline benchmarking
  └── Resource profiling (CPU, RAM, GC pressure)
  │
  ▼
PHASE 6: Real-World Experiments
  └── ISO 9241-9 Fitts' Law target acquisition trials
  │
  ▼
PHASE 7: UI/UX Redesign
  └── Accessible HUD, high-contrast styling, feedback meters
  │
  ▼
PHASE 8: Architecture Cleanup
  └── Modularize core/vision.js into clean ES packages
  │
  ▼
PHASE 9: Privacy + Attribution + Repository Identity
  └── Clean licensing, documentation, and attribution
  │
  ▼
PHASE 10: Performance Optimization
  └── Frame scheduling, WebGL pipeline tuning, memory bounds
  │
  ▼
PHASE 11: Final Validation
  └── Comprehensive validation report & release build
```
