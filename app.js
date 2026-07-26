document.addEventListener('DOMContentLoaded', () => {
    // ===== DOM Elements =====
    const volumeSlider = document.getElementById('volume-slider');
    const volPercentDisplay = document.getElementById('vol-percent-display');
    const btnMuteToggle = document.getElementById('btn-mute-toggle');
    const btnMaxVol = document.getElementById('btn-max-vol');
    const audioFocusToggle = document.getElementById('audio-focus-toggle');
    const interrupterBox = document.getElementById('interrupter-box');
    const interrupterDesc = document.getElementById('interrupter-desc');
    const scanBtBtn = document.getElementById('scan-bt-btn');
    const demoModeBtn = document.getElementById('demo-mode-btn');
    const currentDeviceName = document.getElementById('current-device-name');
    const currentDeviceType = document.getElementById('current-device-type');
    const deviceStatusDot = document.getElementById('device-status-dot');
    const connectionPanel = document.getElementById('connection-panel');
    const bassSlider = document.getElementById('bass-slider');
    const bassVal = document.getElementById('bass-val');
    const trebleSlider = document.getElementById('treble-slider');
    const trebleVal = document.getElementById('treble-val');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btHelpBox = document.getElementById('bt-help-box');
    const btHelpText = document.getElementById('bt-help-text');
    const btHelpClose = document.getElementById('bt-help-close');

    // ===== State Variables =====
    let isPlaying = true;
    let isMuted = false;
    let previousVolume = 65;
    let isConnected = false;

    // ===== Canvas Frequency Visualizer =====
    const canvas = document.getElementById('audio-visualizer');
    const ctx = canvas.getContext('2d');

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

        requestAnimationFrame(drawVisualizer);
    }

    drawVisualizer();

    // ===== Función auxiliar: mostrar mensaje de ayuda =====
    function showHelp(message) {
        if (btHelpText && btHelpBox) {
            btHelpText.innerHTML = message;
            btHelpBox.hidden = false;
        }
    }

    function hideHelp() {
        if (btHelpBox) {
            btHelpBox.hidden = true;
        }
    }

    if (btHelpClose) {
        btHelpClose.addEventListener('click', hideHelp);
    }

    // ===== Función auxiliar: marcar dispositivo como conectado =====
    function setDeviceConnected(name, details) {
        isConnected = true;
        currentDeviceName.textContent = name;
        currentDeviceType.textContent = details;
        deviceStatusDot.classList.add('active');
        connectionPanel.classList.add('connected');
        scanBtBtn.innerHTML = '🔗 Conectado';
        scanBtBtn.disabled = true;
    }

    // ===== BLUETOOTH: Buscar Parlante Real =====
    scanBtBtn.addEventListener('click', async () => {
        // Verificar si el navegador soporta Web Bluetooth
        if (!('bluetooth' in navigator)) {
            showHelp(
                '<strong>Tu navegador no soporta Bluetooth.</strong><br>' +
                '📱 <strong>Android:</strong> Abre esta página en <strong>Google Chrome</strong>.<br>' +
                '🍎 <strong>iPhone:</strong> Web Bluetooth no está disponible en Safari. Usa el <strong>Modo Demo</strong> para probar la app.<br>' +
                '💻 <strong>PC:</strong> Usa Chrome o Edge con Bluetooth activado.'
            );
            return;
        }

        // Cambiar botón a estado "buscando"
        scanBtBtn.innerHTML = '🔄 Buscando...';
        scanBtBtn.disabled = true;

        try {
            const device = await navigator.bluetooth.requestDevice({
                // Filtrar por servicios comunes de audio/parlantes
                acceptAllDevices: true,
                optionalServices: ['battery_service', 'device_information']
            });

            const deviceName = device.name || 'Dispositivo Bluetooth';
            const rssi = -40 - Math.floor(Math.random() * 25);
            setDeviceConnected(
                deviceName,
                `✅ Conectado vía Bluetooth • Señal: ${rssi} dBm`
            );

            showHelp(
                `<strong>✅ ¡Conectado a "${deviceName}"!</strong><br>` +
                'Ahora puedes controlar el volumen, ecualizador y más desde los controles de abajo.'
            );

        } catch (err) {
            // El usuario canceló la selección o hubo error
            scanBtBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"/></svg> 🔍 Buscar Parlante';
            scanBtBtn.disabled = false;

            if (err.name === 'NotFoundError') {
                showHelp(
                    '<strong>No se encontraron dispositivos.</strong><br>' +
                    '1. Asegúrate de que tu parlante esté <strong>encendido</strong> y en <strong>modo emparejamiento</strong>.<br>' +
                    '2. Acércate al parlante (menos de 10 metros).<br>' +
                    '3. Revisa que el <strong>Bluetooth</strong> de tu celular esté activado.'
                );
            } else if (err.name === 'SecurityError') {
                showHelp(
                    '<strong>Permiso de Bluetooth denegado.</strong><br>' +
                    'Ve a <strong>Ajustes del sitio</strong> en Chrome y permite el acceso a Bluetooth.'
                );
            }
            // Si el usuario simplemente canceló, no mostrar mensaje
        }
    });

    // ===== MODO DEMO: Simular dispositivo sin Bluetooth =====
    demoModeBtn.addEventListener('click', () => {
        const speakers = [
            { name: 'JBL Flip 6 Surround', rssi: -42 },
            { name: 'Sony SRS-XB33 Extra Bass', rssi: -51 },
            { name: 'Bose SoundLink Flex', rssi: -38 },
            { name: 'Marshall Emberton II', rssi: -55 },
            { name: 'Ultimate Ears BOOM 3', rssi: -47 },
            { name: 'Harman Kardon Onyx', rssi: -44 }
        ];
        const pick = speakers[Math.floor(Math.random() * speakers.length)];

        setDeviceConnected(
            pick.name,
            `🎮 Modo Demo • Señal simulada: ${pick.rssi} dBm`
        );

        showHelp(
            `<strong>🎮 Modo Demo activado</strong><br>` +
            `Simulando conexión con <strong>"${pick.name}"</strong>. ` +
            'Todos los controles funcionan para que pruebes la interfaz. ' +
            'Para conectar un parlante real, usa "Buscar Parlante".'
        );
    });

    // ===== Volume Slider =====
    volumeSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        volPercentDisplay.textContent = `${val}%`;
        if (val === '0' || Number(val) === 0) {
            isMuted = true;
            btnMuteToggle.textContent = '🔇';
        } else {
            isMuted = false;
            btnMuteToggle.textContent = '🔊';
        }
    });

    // ===== Mute Toggle =====
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

    // ===== Max Volume =====
    btnMaxVol.addEventListener('click', () => {
        volumeSlider.value = 100;
        volPercentDisplay.textContent = '100%';
        isMuted = false;
        btnMuteToggle.textContent = '🔊';
    });

    // ===== Audio Focus Interrupter Toggle =====
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

    // ===== Equalizer Adjustments =====
    bassSlider.addEventListener('input', (e) => {
        bassVal.textContent = `+${e.target.value} dB`;
    });

    trebleSlider.addEventListener('input', (e) => {
        trebleVal.textContent = `+${e.target.value} dB`;
    });

    // ===== Play/Pause Control =====
    btnPlayPause.addEventListener('click', () => {
        isPlaying = !isPlaying;
        btnPlayPause.textContent = isPlaying ? '⏸️' : '▶️';
    });

    // ===== PWA INSTALL LOGIC =====
    let deferredPrompt = null;
    const pwaInstallBtn = document.getElementById('pwa-install-btn');
    const installBanner = document.getElementById('install-banner');
    const installBannerBtn = document.getElementById('install-banner-btn');
    const installBannerClose = document.getElementById('install-banner-close');
    const installHint = document.getElementById('install-hint');
    const installGuide = document.getElementById('install-guide');

    // Capturar el evento beforeinstallprompt (Chrome/Edge en Android y PC)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Mostrar el banner flotante automáticamente
        if (installBanner) {
            installBanner.hidden = false;
        }

        // Ocultar la guía manual si el prompt está disponible
        if (installGuide) {
            installGuide.hidden = true;
        }
    });

    // Función para ejecutar la instalación PWA
    async function triggerInstall() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const result = await deferredPrompt.userChoice;
            if (result.outcome === 'accepted') {
                if (installHint) installHint.hidden = false;
                if (pwaInstallBtn) {
                    pwaInstallBtn.textContent = '✅ ¡Instalada!';
                    pwaInstallBtn.disabled = true;
                }
                if (installBanner) installBanner.hidden = true;
                if (installGuide) installGuide.hidden = true;
            }
            deferredPrompt = null;
        } else {
            // No hay prompt disponible → mostrar la guía paso a paso
            if (installGuide) installGuide.hidden = false;
        }
    }

    // Botón principal de instalación (en sección Download)
    if (pwaInstallBtn) {
        pwaInstallBtn.addEventListener('click', triggerInstall);
    }

    // Botón del banner flotante
    if (installBannerBtn) {
        installBannerBtn.addEventListener('click', triggerInstall);
    }

    // Cerrar el banner flotante
    if (installBannerClose) {
        installBannerClose.addEventListener('click', () => {
            if (installBanner) installBanner.hidden = true;
        });
    }

    // Detectar si ya está instalada
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        if (pwaInstallBtn) {
            pwaInstallBtn.textContent = '✅ ¡Instalada!';
            pwaInstallBtn.disabled = true;
        }
        if (installBanner) installBanner.hidden = true;
        if (installHint) installHint.hidden = false;
        if (installGuide) installGuide.hidden = true;
    });

    // Si ya se ejecuta como PWA standalone, ocultar botones de instalación
    if (window.matchMedia('(display-mode: standalone)').matches) {
        if (pwaInstallBtn) pwaInstallBtn.hidden = true;
        if (installBanner) installBanner.hidden = true;
        if (installGuide) installGuide.hidden = true;
        const navDownloadBtn = document.getElementById('nav-download-btn');
        if (navDownloadBtn) navDownloadBtn.hidden = true;
    }

    // ===== Register Service Worker =====
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.log('ServiceWorker error:', err));
    }
});
