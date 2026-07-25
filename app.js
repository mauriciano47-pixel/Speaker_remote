document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const volumeSlider = document.getElementById('volume-slider');
    const volPercentDisplay = document.getElementById('vol-percent-display');
    const btnMuteToggle = document.getElementById('btn-mute-toggle');
    const btnMaxVol = document.getElementById('btn-max-vol');
    const audioFocusToggle = document.getElementById('audio-focus-toggle');
    const interrupterBox = document.getElementById('interrupter-box');
    const interrupterDesc = document.getElementById('interrupter-desc');
    const scanBtBtn = document.getElementById('scan-bt-btn');
    const currentDeviceName = document.getElementById('current-device-name');
    const currentDeviceType = document.getElementById('current-device-type');
    const bassSlider = document.getElementById('bass-slider');
    const bassVal = document.getElementById('bass-val');
    const trebleSlider = document.getElementById('treble-slider');
    const trebleVal = document.getElementById('treble-val');
    const btnPlayPause = document.getElementById('btn-play-pause');

    // State Variables
    let isPlaying = true;
    let isMuted = false;
    let previousVolume = 65;

    // Canvas Frequency Visualizer
    const canvas = document.getElementById('audio-visualizer');
    const ctx = canvas.getContext('2d');
    let animFrameId;

    function drawVisualizer() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bars = 40;
        const barWidth = (canvas.width / bars) - 2;

        for (let i = 0; i < bars; i++) {
            let height = isPlaying ? Math.random() * (canvas.height * 0.8) + 10 : 4;
            if (isMuted) height = 2;

            const x = i * (barWidth + 2);
            const y = canvas.height - height;

            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, '#6C5CE7');
            gradient.addColorStop(1, '#00CEC9');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, height);
        }

        animFrameId = requestAnimationFrame(drawVisualizer);
    }

    drawVisualizer();

    // Volume Slider Event
    volumeSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        volPercentDisplay.textContent = `${val}%`;
        if (val == 0) {
            isMuted = true;
            btnMuteToggle.textContent = '🔇';
        } else {
            isMuted = false;
            btnMuteToggle.textContent = '🔊';
        }
    });

    // Mute Toggle Event
    btnMuteToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        if (isMuted) {
            previousVolume = volumeSlider.value;
            volumeSlider.value = 0;
            volPercentDisplay.textContent = '0%';
            btnMuteToggle.textContent = '🔇';
        } else {
            volumeSlider.value = previousVolume > 0 ? previousVolume : 65;
            volPercentDisplay.textContent = `${volumeSlider.value}%`;
            btnMuteToggle.textContent = '🔊';
        }
    });

    // Max Volume Event
    btnMaxVol.addEventListener('click', () => {
        volumeSlider.value = 100;
        volPercentDisplay.textContent = '100%';
        isMuted = false;
        btnMuteToggle.textContent = '🔊';
    });

    // Audio Focus Interrupter Toggle
    audioFocusToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            interrupterBox.style.borderColor = '#FF007F';
            interrupterBox.style.background = 'rgba(255, 0, 127, 0.2)';
            interrupterDesc.textContent = '⚡ ACTIVO: Forzando Foco Exclusivo de Audio y anulando otras fuentes';
        } else {
            interrupterBox.style.borderColor = 'rgba(255, 0, 127, 0.3)';
            interrupterBox.style.background = 'rgba(255, 0, 127, 0.08)';
            interrupterDesc.textContent = 'Bloquea transmisiones de otros dispositivos conectados al parlante';
        }
    });

    // Equalizer Adjustments
    bassSlider.addEventListener('input', (e) => {
        bassVal.textContent = `+${e.target.value} dB`;
    });

    trebleSlider.addEventListener('input', (e) => {
        trebleVal.textContent = `+${e.target.value} dB`;
    });

    // Play/Pause Control
    btnPlayPause.addEventListener('click', () => {
        isPlaying = !isPlaying;
        btnPlayPause.textContent = isPlaying ? '⏸️' : '▶️';
    });

    // Web Bluetooth API Integration
    scanBtBtn.addEventListener('click', async () => {
        if ('bluetooth' in navigator) {
            try {
                const device = await navigator.bluetooth.requestDevice({
                    acceptAllDevices: true,
                    optionalServices: ['battery_service']
                });
                currentDeviceName.textContent = device.name || 'Parlante Bluetooth Detectado';
                currentDeviceType.textContent = `Conectado vía Web Bluetooth API • ID: ${device.id.substring(0, 8)}...`;
            } catch (err) {
                console.log('Bluetooth pairing cancelled or not selected');
            }
        } else {
            // Fallback demo device selector
            const speakers = ["JBL Flip 6 Surround", "Sony SRS-XB33 Extra Bass", "Bose SoundLink Flex", "Marshall Emberton II"];
            const randomSpeaker = speakers[Math.floor(Math.random() * speakers.length)];
            currentDeviceName.textContent = randomSpeaker;
            currentDeviceType.textContent = `Conectado A2DP • RSSI: ${-40 - Math.floor(Math.random() * 30)} dBm`;
        }
    });

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.log('ServiceWorker error:', err));
    }
});
