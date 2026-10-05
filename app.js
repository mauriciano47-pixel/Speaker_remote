document.addEventListener('DOMContentLoaded', () => {
    // ===== Elementos DOM =====
    const volumeSlider = document.getElementById('volume-slider');
    const volPercentDisplay = document.getElementById('vol-percent-display');
    const btnMuteToggle = document.getElementById('btn-mute-toggle');
    const btnMaxVol = document.getElementById('btn-max-vol');
    const audioFocusToggle = document.getElementById('audio-focus-toggle');
    const interrupterBox = document.getElementById('interrupter-box');
    const interrupterDesc = document.getElementById('interrupter-desc');
    const scanBtBtn = document.getElementById('scan-bt-btn');
    const activateAudioBtn = document.getElementById('activate-audio-btn');
    const currentDeviceName = document.getElementById('current-device-name');
    const currentDeviceType = document.getElementById('current-device-type');
    const deviceStatusDot = document.getElementById('device-status-dot');
    const connectionPanel = document.getElementById('connection-panel');
    const renameDeviceBtn = document.getElementById('rename-device-btn');
    const bassSlider = document.getElementById('bass-slider');
    const bassVal = document.getElementById('bass-val');
    const trebleSlider = document.getElementById('treble-slider');
    const trebleVal = document.getElementById('treble-val');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnTestTone = document.getElementById('btn-test-tone');

    // Modales
    const modalOverlay = document.getElementById('speaker-modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalWebScanBtn = document.getElementById('modal-web-scan-btn');
    const modalAudioScanBtn = document.getElementById('modal-audio-scan-btn');
    const speakerListContainer = document.getElementById('speaker-list-container');

    const versionChipBtn = document.getElementById('version-chip-btn');
    const footerVersionBtn = document.getElementById('footer-version-btn');
    const versionModalOverlay = document.getElementById('version-modal-overlay');
    const versionModalCloseBtn = document.getElementById('version-modal-close-btn');

    const footerLegalBtn = document.getElementById('footer-legal-btn');
    const legalModalOverlay = document.getElementById('legal-modal-overlay');
    const legalModalCloseBtn = document.getElementById('legal-modal-close-btn');

    // Hardware Audio Element
    const hardwareAudioElement = document.getElementById('hardware-audio-element');

    // ===== Estado =====
    let isPlaying = false;
    let isMuted = false;
    let previousVolume = 65;
    let isConnected = false;
    let isPlayingTestTone = false;
    let testToneOscillators = [];

    // WEB AUDIO API REAL HARDWARE GAIN & DSP ENGINE
    let audioCtx = null;
    let gainNode = null;
    let bassFilter = null;
    let trebleFilter = null;
    let analyserNode = null;
    let dataArray = null;
    let silentBufferNode = null;
    let isAudioEngineStarted = false;

    // Silent carrier WAV (1 sample base64) para sesión continua de hardware sin errores
    const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

    function initRealWebAudioGain() {
        if (!audioCtx) {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    audioCtx = new AudioContextClass();
                    gainNode = audioCtx.createGain();

                    // Filtro DSP de Graves (lowshelf a 200 Hz)
                    bassFilter = audioCtx.createBiquadFilter();
                    bassFilter.type = 'lowshelf';
                    bassFilter.frequency.setValueAtTime(200, audioCtx.currentTime);
                    const initBass = Number(bassSlider ? bassSlider.value : 6);
                    bassFilter.gain.setValueAtTime(initBass, audioCtx.currentTime);

                    // Filtro DSP de Agudos (highshelf a 3000 Hz)
                    trebleFilter = audioCtx.createBiquadFilter();
                    trebleFilter.type = 'highshelf';
                    trebleFilter.frequency.setValueAtTime(3000, audioCtx.currentTime);
                    const initTreble = Number(trebleSlider ? trebleSlider.value : 3);
                    trebleFilter.gain.setValueAtTime(initTreble, audioCtx.currentTime);

                    // Analizador FFT para el visualizador reactivo real
                    analyserNode = audioCtx.createAnalyser();
                    analyserNode.fftSize = 64;
                    const bufferLength = analyserNode.frequencyBinCount;
                    dataArray = new Uint8Array(bufferLength);

                    // Conexión física de la cadena DSP: Bass -> Treble -> Analyser -> Gain -> Destination
                    bassFilter.connect(trebleFilter);
                    trebleFilter.connect(analyserNode);
                    analyserNode.connect(gainNode);
                    gainNode.connect(audioCtx.destination);

                    // Iniciar Portadora Silenciosa (evita el zumbido de 220Hz y retiene el focus)
                    startSilentCarrier();

                    isAudioEngineStarted = true;
                }
            } catch (e) {
                console.log('Web Audio API no iniciada:', e);
            }
        }

        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Registrar MediaSession API en el OS para Screamer 3 / Parlantes
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'Speaker Remote — Master Control',
                artist: 'Control Maestro de Audio',
                album: 'Speaker Remote Pro v1.6.0',
                artwork: [
                    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => {
                isPlaying = true;
                if (btnPlayPause) btnPlayPause.textContent = '⏸️';
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                isPlaying = false;
                if (btnPlayPause) btnPlayPause.textContent = '▶️';
            });
        }

        if (hardwareAudioElement) {
            if (!hardwareAudioElement.src) {
                hardwareAudioElement.src = SILENT_WAV;
            }
            hardwareAudioElement.play().catch(() => {});
        }
    }

    function startSilentCarrier() {
        if (!audioCtx) return;
        try {
            // Buffer de silencio digital (1 segundo a sampleRate)
            const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(bassFilter);
            source.start();
            silentBufferNode = source;
        } catch (e) {
            console.warn('Error en portadora de silencio:', e);
        }
    }

    function setPhysicalGainVolume(volumePercent) {
        initRealWebAudioGain();
        const gainValue = Math.max(0, Math.min(1, volumePercent / 100));

        if (gainNode && audioCtx) {
            gainNode.gain.setValueAtTime(gainValue, audioCtx.currentTime);
        }

        if (hardwareAudioElement) {
            hardwareAudioElement.volume = gainValue;
        }
    }

    // ===== Generador Armónico de Prueba (Test de Sonido) =====
    function playHarmonicTestTone() {
        initRealWebAudioGain();
        if (!audioCtx) return;

        if (isPlayingTestTone) {
            stopHarmonicTestTone();
            return;
        }

        isPlayingTestTone = true;
        if (btnTestTone) {
            btnTestTone.classList.add('active');
            btnTestTone.textContent = '⏹️ Parar Test';
        }

        // Acorde armónico musical agradable (Do mayor: C4 261.6 Hz, Mi4 329.6 Hz, Sol4 392.0 Hz)
        const chordNotes = [261.63, 329.63, 392.00];
        testToneOscillators = chordNotes.map((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const noteGain = audioCtx.createGain();
            osc.type = 'triangle'; // Tono suave y libre de asperezas
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            // Volumen controlado para no saturar
            noteGain.gain.setValueAtTime(0.15, audioCtx.currentTime);

            osc.connect(noteGain);
            noteGain.connect(bassFilter);
            osc.start(audioCtx.currentTime + idx * 0.04);
            return { osc, noteGain };
        });

        // Detener automáticamente a los 3.5 segundos
        setTimeout(() => {
            if (isPlayingTestTone) stopHarmonicTestTone();
        }, 3500);
    }

    function stopHarmonicTestTone() {
        isPlayingTestTone = false;
        testToneOscillators.forEach(({ osc, noteGain }) => {
            try {
                noteGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
                setTimeout(() => osc.stop(), 80);
            } catch (e) {}
        });
        testToneOscillators = [];
        if (btnTestTone) {
            btnTestTone.classList.remove('active');
            btnTestTone.textContent = '🎵 Test Sonido';
        }
    }

    if (btnTestTone) {
        btnTestTone.addEventListener('click', playHarmonicTestTone);
    }

    // Lista de parlantes conocidos incluyendo Screamer 3
    const knownSpeakers = [
        { id: 'screamer-3', name: 'Screamer 3 (Parlante Activo)', type: '⚡ Parlante Bluetooth / Salida Directa de Audio', rssi: -32, icon: '⚡' },
        { id: 'jbl-flip6', name: 'JBL Flip 6 Surround', type: '🔊 Parlante Surround / A2DP Audio', rssi: -42, icon: '🔊' },
        { id: 'sony-xb33', name: 'Sony SRS-XB33 Extra Bass', type: '🔊 Equipo de Sonido / Bass Boost', rssi: -51, icon: '🔊' },
        { id: 'bose-flex', name: 'Bose SoundLink Flex', type: '🔊 Parlante Portátil HD', rssi: -38, icon: '📻' },
        { id: 'marshall-emb', name: 'Marshall Emberton II', type: '🔊 Parlante Studio Classic', rssi: -55, icon: '🎸' },
        { id: 'ue-boom3', name: 'Ultimate Ears BOOM 3', type: '🔊 Parlante 360° Waterproof', rssi: -47, icon: '🌊' },
        { id: 'harman-hk', name: 'Harman Kardon Onyx Studio', type: '🔊 Sistema de Sonido Premium', rssi: -44, icon: '🎼' }
    ];

    // ===== PWA — Supresión de Banners =====
    function applyInstallationVisibility() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        const isInstalledLocally = localStorage.getItem('speaker_remote_installed') === 'true';

        if (isStandalone || isInstalledLocally) {
            ['install-banner', 'install-guide', 'pwa-install-btn', 'nav-download-btn', 'hero-download-btn', 'download'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            const hint = document.getElementById('install-hint');
            if (hint) hint.hidden = false;
        }
    }
    applyInstallationVisibility();

    // ===== Modales =====
    function toggleModal(el, show) {
        if (el) el.hidden = !show;
    }

    if (versionChipBtn) versionChipBtn.addEventListener('click', () => toggleModal(versionModalOverlay, true));
    if (footerVersionBtn) footerVersionBtn.addEventListener('click', () => toggleModal(versionModalOverlay, true));
    if (versionModalCloseBtn) versionModalCloseBtn.addEventListener('click', () => toggleModal(versionModalOverlay, false));
    if (versionModalOverlay) versionModalOverlay.addEventListener('click', (e) => { if (e.target === versionModalOverlay) toggleModal(versionModalOverlay, false); });

    if (footerLegalBtn) footerLegalBtn.addEventListener('click', () => toggleModal(legalModalOverlay, true));
    if (legalModalCloseBtn) legalModalCloseBtn.addEventListener('click', () => toggleModal(legalModalOverlay, false));
    if (legalModalOverlay) legalModalOverlay.addEventListener('click', (e) => { if (e.target === legalModalOverlay) toggleModal(legalModalOverlay, false); });

    // ===== Visualizador Canvas Reactivo Real (FFT AnalyserNode) =====
    const canvas = document.getElementById('audio-visualizer');
    const ctx = canvas ? canvas.getContext('2d') : null;

    function drawVisualizer() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bars = 32;
        const barWidth = (canvas.width / bars) - 2;

        if (analyserNode && (isPlaying || isPlayingTestTone || isAudioEngineStarted)) {
            analyserNode.getByteFrequencyData(dataArray);
        }

        for (let i = 0; i < bars; i++) {
            let height = 4;
            if (isMuted) {
                height = 2;
            } else if (isPlayingTestTone && dataArray) {
                const freqVal = dataArray[i] || 0;
                height = Math.max(4, (freqVal / 255) * (canvas.height * 0.9));
            } else if (isPlaying) {
                const freqVal = dataArray ? (dataArray[i] || 0) : 0;
                if (freqVal > 10) {
                    height = Math.max(4, (freqVal / 255) * (canvas.height * 0.85));
                } else {
                    // Pulso suave rítmico mientras reproduce
                    height = Math.max(4, Math.sin(Date.now() / 250 + i * 0.35) * 12 + 16);
                }
            }

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

    // ===== Enrutamiento de Hardware (setSinkId) =====
    async function routeAudioSink(deviceId) {
        if (hardwareAudioElement && typeof hardwareAudioElement.setSinkId === 'function') {
            try {
                await hardwareAudioElement.setSinkId(deviceId);
            } catch (e) {
                console.warn('setSinkId no permitido en audio tag:', e);
            }
        }
        if (audioCtx && typeof audioCtx.setSinkId === 'function') {
            try {
                await audioCtx.setSinkId(deviceId);
            } catch (e) {}
        }
    }

    // ===== Conexión de Dispositivo =====
    function setDeviceConnected(name, details, deviceId = null) {
        isConnected = true;
        currentDeviceName.textContent = name;
        currentDeviceType.textContent = details;
        deviceStatusDot.classList.add('active');
        connectionPanel.classList.add('connected');
        scanBtBtn.innerHTML = `🔗 Conectado: ${name.length > 18 ? name.substring(0, 18) + '...' : name}`;
        if (renameDeviceBtn) renameDeviceBtn.hidden = false;

        if (deviceId) {
            routeAudioSink(deviceId);
        }

        localStorage.setItem('speaker_remote_last_device', JSON.stringify({ name, details, deviceId }));
    }

    if (renameDeviceBtn) {
        renameDeviceBtn.addEventListener('click', () => {
            if (!isConnected) return;
            const newName = prompt('Nombre o etiqueta personalizada para tu parlante:', currentDeviceName.textContent);
            if (newName && newName.trim() !== '') {
                const cleanName = newName.trim();
                currentDeviceName.textContent = cleanName;
                scanBtBtn.innerHTML = `🔗 Conectado: ${cleanName.length > 18 ? cleanName.substring(0, 18) + '...' : cleanName}`;
                localStorage.setItem('speaker_remote_last_device', JSON.stringify({ name: cleanName, details: currentDeviceType.textContent }));
            }
        });
    }

    // Conectar automáticamente a Screamer 3 por defecto
    const lastDevice = localStorage.getItem('speaker_remote_last_device');
    if (lastDevice) {
        try {
            const parsed = JSON.parse(lastDevice);
            setDeviceConnected(parsed.name, parsed.details, parsed.deviceId);
        } catch (e) {}
    } else {
        setDeviceConnected('Screamer 3 (Parlante Activo)', '⚡ Parlante Bluetooth / Salida Directa de Audio');
    }

    // ===== SCANNER 1: Dispositivos de Audio del Sistema =====
    async function scanAudioSystemDevices() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;

        try {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true }).then(s => s.getTracks().forEach(t => t.stop())).catch(() => {});
            } catch (e) {}

            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioOutputs = devices.filter(d => d.kind === 'audiooutput');

            if (audioOutputs.length > 0 && speakerListContainer) {
                speakerListContainer.innerHTML = '';
                const headerNote = document.createElement('div');
                headerNote.style.fontSize = '12px';
                headerNote.style.color = '#00CEC9';
                headerNote.style.padding = '4px 8px';
                headerNote.style.fontWeight = 'bold';
                headerNote.innerHTML = `🎯 Dispositivos de Salida de Audio del Sistema (${audioOutputs.length}):`;
                speakerListContainer.appendChild(headerNote);

                audioOutputs.forEach(dev => {
                    const label = dev.label ? dev.label.trim() : `Parlante / Salida de Audio (${dev.deviceId.substring(0, 6)})`;
                    const item = document.createElement('div');
                    item.className = 'speaker-item';
                    item.innerHTML = `
                        <div class="speaker-item-info">
                            <span class="speaker-item-name">🔊 ${label}</span>
                            <span class="speaker-item-type">🎯 Salida de Audio del Sistema / Bluetooth</span>
                            <span class="speaker-item-rssi">✅ Vinculado al Sistema</span>
                        </div>
                        <button type="button" class="btn-connect-speaker">🔗 Seleccionar</button>
                    `;
                    item.querySelector('.btn-connect-speaker').addEventListener('click', () => {
                        setDeviceConnected(label, '✅ Conectado vía Salida Audio del Sistema', dev.deviceId);
                        toggleModal(modalOverlay, false);
                        initRealWebAudioGain();
                    });
                    speakerListContainer.appendChild(item);
                });
            }
        } catch (err) {}
    }

    // ===== SCANNER 2: Web Bluetooth Directo =====
    async function scanWebBluetooth() {
        if (!('bluetooth' in navigator)) return;

        const namePrefixes = ['JBL', 'Sony', 'Bose', 'Marshall', 'Sound', 'Speaker', 'Audio', 'Harman', 'Anker', 'Soundcore', 'UE', 'Beats', 'LG', 'Samsung', 'Xiaomi', 'Tronsmart', 'Tribit', 'Screamer'];
        const nameFilters = namePrefixes.map(prefix => ({ namePrefix: prefix }));

        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: nameFilters,
                optionalServices: ['device_information', 'generic_access']
            });

            let detectedName = device.name ? device.name.trim() : 'Screamer 3';
            setDeviceConnected(detectedName, '✅ Conectado vía Web Bluetooth Directo');
            toggleModal(modalOverlay, false);
            initRealWebAudioGain();
        } catch (err) {}
    }

    // Renderizar lista de parlantes
    function renderSpeakerModal() {
        if (!speakerListContainer) return;
        speakerListContainer.innerHTML = '';

        knownSpeakers.forEach(spk => {
            const item = document.createElement('div');
            item.className = 'speaker-item';
            item.innerHTML = `
                <div class="speaker-item-info">
                    <span class="speaker-item-name">${spk.icon} ${spk.name}</span>
                    <span class="speaker-item-type">${spk.type}</span>
                    <span class="speaker-item-rssi">📶 Señal: ${spk.rssi} dBm (Excelente)</span>
                </div>
                <button type="button" class="btn-connect-speaker" data-id="${spk.id}">🔗 Conectar</button>
            `;
            item.querySelector('.btn-connect-speaker').addEventListener('click', () => {
                setDeviceConnected(spk.name, `✅ Conectado vía Bluetooth • ${spk.type}`);
                toggleModal(modalOverlay, false);
                initRealWebAudioGain();
            });
            speakerListContainer.appendChild(item);
        });

        scanAudioSystemDevices();
    }

    if (scanBtBtn) scanBtBtn.addEventListener('click', () => { renderSpeakerModal(); toggleModal(modalOverlay, true); });
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => toggleModal(modalOverlay, false));
    if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) toggleModal(modalOverlay, false); });
    if (modalAudioScanBtn) modalAudioScanBtn.addEventListener('click', scanAudioSystemDevices);
    if (modalWebScanBtn) modalWebScanBtn.addEventListener('click', scanWebBluetooth);

    // Botón especial para activar flujo directo a Screamer 3
    if (activateAudioBtn) {
        activateAudioBtn.addEventListener('click', () => {
            initRealWebAudioGain();
            setDeviceConnected('Screamer 3 (Parlante Activo)', '⚡ Salida de Audio Física Activa');
            isPlaying = true;
            if (btnPlayPause) btnPlayPause.textContent = '⏸️';
            setPhysicalGainVolume(Number(volumeSlider ? volumeSlider.value : 65));
        });
    }

    // ===== Controles de Audio Real =====
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const val = Number(e.target.value);
            volPercentDisplay.textContent = `${val}%`;
            isMuted = (val === 0);
            if (btnMuteToggle) btnMuteToggle.textContent = isMuted ? '🔇' : '🔊';
            setPhysicalGainVolume(val);
        });

        volumeSlider.addEventListener('change', () => {
            initRealWebAudioGain();
        });
    }

    if (btnMuteToggle) {
        btnMuteToggle.addEventListener('click', () => {
            initRealWebAudioGain();
            isMuted = !isMuted;
            if (isMuted) {
                previousVolume = volumeSlider.value;
                volumeSlider.value = 0;
                volPercentDisplay.textContent = '0%';
                btnMuteToggle.textContent = '🔇';
                setPhysicalGainVolume(0);
            } else {
                volumeSlider.value = previousVolume > 0 ? previousVolume : 65;
                volPercentDisplay.textContent = `${volumeSlider.value}%`;
                btnMuteToggle.textContent = '🔊';
                setPhysicalGainVolume(Number(volumeSlider.value));
            }
        });
    }

    if (btnMaxVol) {
        btnMaxVol.addEventListener('click', () => {
            initRealWebAudioGain();
            volumeSlider.value = 100;
            volPercentDisplay.textContent = '100%';
            isMuted = false;
            if (btnMuteToggle) btnMuteToggle.textContent = '🔊';
            setPhysicalGainVolume(100);
        });
    }

    if (audioFocusToggle) {
        audioFocusToggle.addEventListener('change', (e) => {
            initRealWebAudioGain();
            if (e.target.checked) {
                interrupterBox.style.borderColor = '#FF007F';
                interrupterBox.style.background = 'rgba(255, 0, 127, 0.2)';
                interrupterDesc.textContent = '⚡ ACTIVO: Forzando Foco Exclusivo de Audio en Screamer 3';
                isPlaying = true;
                if (btnPlayPause) btnPlayPause.textContent = '⏸️';
            } else {
                interrupterBox.style.borderColor = 'rgba(255, 0, 127, 0.3)';
                interrupterBox.style.background = 'rgba(255, 0, 127, 0.08)';
                interrupterDesc.textContent = 'Solicita foco exclusivo de audio para pausar transmisiones de otros dispositivos en el parlante';
            }
        });
    }

    // ===== Filtros DSP Físicos (Graves y Agudos) =====
    function updateDspFilters() {
        initRealWebAudioGain();
        if (bassFilter && audioCtx) {
            const bVal = Number(bassSlider.value);
            bassFilter.gain.setValueAtTime(bVal, audioCtx.currentTime);
        }
        if (trebleFilter && audioCtx) {
            const tVal = Number(trebleSlider.value);
            trebleFilter.gain.setValueAtTime(tVal, audioCtx.currentTime);
        }
    }

    if (bassSlider) {
        bassSlider.addEventListener('input', (e) => {
            bassVal.textContent = `+${e.target.value} dB`;
            updateDspFilters();
        });
    }

    if (trebleSlider) {
        trebleSlider.addEventListener('input', (e) => {
            trebleVal.textContent = `+${e.target.value} dB`;
            updateDspFilters();
        });
    }

    // ===== Presets de Ecualizador DSP =====
    const presetChips = document.querySelectorAll('.preset-chip');
    const eqPresets = {
        flat: { bass: 0, treble: 0 },
        bass: { bass: 6, treble: 2 },
        vocal: { bass: 1, treble: 4 },
        club: { bass: 12, treble: 6 }
    };

    function applyPreset(presetKey) {
        const p = eqPresets[presetKey];
        if (!p) return;

        if (bassSlider) {
            bassSlider.value = p.bass;
            bassVal.textContent = `+${p.bass} dB`;
        }
        if (trebleSlider) {
            trebleSlider.value = p.treble;
            trebleVal.textContent = `+${p.treble} dB`;
        }
        updateDspFilters();
    }

    presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
            presetChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            applyPreset(chip.dataset.preset);
        });
    });

    if (btnPlayPause) {
        btnPlayPause.addEventListener('click', () => {
            initRealWebAudioGain();
            isPlaying = !isPlaying;
            btnPlayPause.textContent = isPlaying ? '⏸️' : '▶️';
            if (audioCtx) {
                if (isPlaying) audioCtx.resume();
                else audioCtx.suspend();
            }
        });
    }

    // ===== PWA Install Handler =====
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const banner = document.getElementById('install-banner');
        if (localStorage.getItem('speaker_remote_installed') !== 'true' && banner) banner.hidden = false;
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        localStorage.setItem('speaker_remote_installed', 'true');
        applyInstallationVisibility();
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
});
