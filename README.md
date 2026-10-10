# 📻⚡ PartySync Pro

**Sincronizador y Cluster Multi-Parlante Bluetooth P2P** — Transmisión distribuida en fase, escenario estéreo multicanal (L / R) y compensador de latencia acústica milimétrica.

[![Versión](https://img.shields.io/badge/versión-v2.0.0--mesh-blue)](https://github.com/mauriciano47-pixel/Speaker_remote)
[![GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen)](https://mauriciano47-pixel.github.io/Speaker_remote/)
[![PWA](https://img.shields.io/badge/PWA-instalable-purple)](https://mauriciano47-pixel.github.io/Speaker_remote/)

## 🌐 Demo en Vivo

👉 **[https://mauriciano47-pixel.github.io/Speaker_remote/](https://mauriciano47-pixel.github.io/Speaker_remote/)**

## 🎯 El Problema de Mercado que Resuelve

El estándar Bluetooth A2DP es estrictamente punto a punto: **un teléfono solo puede transmitir audio a un único parlante a la vez**. Si estás en una reunión, fiesta o paseo al aire libre y tienes dos parlantes de marcas distintas (por ejemplo, un Screamer 3 y un JBL o Sony), no existe forma nativa de hacerlos sonar juntos sin comprar cables divisores analógicos o equipos de marca idéntica.

**PartySync Pro** resuelve este dolor convirtiendo la web en una red de transmisión P2P:
1. **Dispositivo 1 (Host DJ):** Se conecta a su parlante (ej. Screamer 3) y crea una sala de fiesta (`SYNC-XXXX`).
2. **Dispositivos Satélites:** Se conectan cada uno a su parlante (ej. JBL Flip, Sony, Bose) y se unen a la sala desde el navegador.
3. **Reproducción en Fase & Calibración de Eco:** Toda la flota reproduce exactamente la misma música al unísono, con compensación de retraso milimétrica para eliminar el eco acústico.

## ⚡ Funciones Principales

| Función | Descripción |
| --- | --- |
| 👑 **Modo Host DJ** | Crea la sala, transmite a toda la flota y controla la reproducción |
| 📻 **Modo Satélite** | Se une a la sala del Host y reproduce en su parlante Bluetooth local |
| ⏱️ **Compensador de Latencia** | Nodo `DelayNode` (0 - 400 ms) para alinear al milisegundo parlantes con diferentes buffers |
| 🎧 **Separación Estéreo (L / R)** | Convierte dos parlantes portátiles en un par estéreo real (Canal Izquierdo y Derecho) |
| 🎵 **Fiesta Groove (Sintetizador)** | Generador de ritmos electrónicos a 128 BPM en tiempo real sin requerir archivos |
| 📂 **Cargador de Audio Local** | Transmite y decodifica cualquier archivo MP3, WAV o FLAC del usuario |
| 🎙️ **Megáfono en Vivo** | Transmite la voz del micrófono del Host a todos los parlantes del cluster |
| 📊 **Espectrograma Reactivo FFT** | Visualizador de frecuencias en tiempo real mediante `AnalyserNode` |
| 🎛️ **Ecualizador DSP Físico** | Filtros `BiquadFilterNode` activos para graves y agudos en cada nodo |
| 📡 **Telemetría de la Flota** | Monitor en vivo de parlantes conectados, estado de fase y retraso |

## 📲 Instalación Rápida

### Opción A (Automática)

1. Abre **Chrome** o **Edge** en tu teléfono o PC y visita la aplicación.
2. Toca **"Instalar"** en el banner flotante inferior.

### Opción B (Manual)

1. Abre la página en **Google Chrome** o **Edge**.
2. Toca el menú **⋮** (tres puntos) en la esquina superior derecha (o botón ⬆️ Compartir en Safari/iOS).
3. Selecciona **"Instalar aplicación"** o **"Agregar a pantalla de inicio"**.

## 🛠️ Stack Tecnológico

- **Frontend Web / PWA:** HTML5, CSS3 Glassmorphism Dark OLED, JavaScript Moderno (ES6+).
- **Procesamiento de Audio Distribuido:** Web Audio API (`AudioContext`, `DelayNode`, `StereoPannerNode`, `BiquadFilterNode`, `AnalyserNode`, `AudioBufferSourceNode`).
- **Sincronización P2P:** BroadcastChannel API + WebRTC DataChannels con servidor STUN público.
- **Control de Sistema:** MediaSession API, MediaDevices API (`enumerateDevices`, `getUserMedia`).
- **PWA:** Service Worker Network-First v2.0.0, Web App Manifest.

## 📁 Estructura del Proyecto

```text
Speaker_remote/
├── index.html          → Interfaz de PartySync, selector de roles, cluster y telemetría
├── index.css           → Estilos glassmorphism, roles Host/Satélite y calibradores
├── app.js              → Motor P2P Mesh, DelayNode, StereoPanner, sintetizador y telemetría
├── sw.js               → Service Worker v2.0.0 (Network-First)
├── manifest.json       → Manifest PWA (Android / iOS / Desktop)
├── icon-192.png        → Ícono PWA 192x192
├── icon-512.png        → Ícono PWA 512x512
├── VERSION.txt         → Versión actual (v2.0.0)
├── ADVERTENCIA_LEGAL_Y_REGULATORIA.md → Marco legal y regulatorio
├── app/                → Módulo complementario Android
└── README.md           → Documentación técnica del proyecto
```

## 👤 Créditos y Titularidad

Desarrollado por **Mauricio Uribe Maldonado (mauriciano47-pixel)** & **Antigravity AI**.

© 2026 PartySync Pro — Todos los derechos reservados.
