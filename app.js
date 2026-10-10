document.addEventListener('DOMContentLoaded', () => {
    // ===== DOM Elements =====
    const tabHostRole = document.getElementById('tab-host-role');
    const tabSatelliteRole = document.getElementById('tab-satellite-role');
    const zoneHost = document.getElementById('zone-host');
    const zoneSatellite = document.getElementById('zone-satellite');

    // Host Elements
    const displayRoomCode = document.getElementById('display-room-code');
    const btnCopyRoom = document.getElementById('btn-copy-room');
    const btnNewRoom = document.getElementById('btn-new-room');
    const sourceBtns = document.querySelectorAll('.source-btn');
    const audioFileInput = document.getElementById('audio-file-input');
    const fileStatusRow = document.getElementById('file-status-row');
    const loadedFileName = document.getElementById('loaded-file-name');
    const btnChooseFile = document.getElementById('btn-choose-file');
    const trackProgress = document.getElementById('track-progress');
    const timeCurrent = document.getElementById('time-current');
    const timeTotal = document.getElementById('time-total');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnTestTone = document.getElementById('btn-test-tone');

    // Satellite Elements
    const satelliteRoomInput = document.getElementById('satellite-room-input');
    const btnJoinRoom = document.getElementById('btn-join-room');
    const satStatusPill = document.getElementById('sat-status-pill');
    const satStatusText = document.getElementById('sat-status-text');
    const channelBtns = document.querySelectorAll('.channel-btn');
    const delaySlider = document.getElementById('delay-slider');
    const delayValBadge = document.getElementById('delay-val-badge');
    const delayStepBtns = document.querySelectorAll('.btn-step');

    // Common Audio Controls
    const volumeSlider = document.getElementById('volume-slider');
    const volPercentDisplay = document.getElementById('vol-percent-display');
    const btnMuteToggle = document.getElementById('btn-mute-toggle');
    const btnMaxVol = document.getElementById('btn-max-vol');
    const bassSlider = document.getElementById('bass-slider');
    const bassVal = document.getElementById('bass-val');
    const trebleSlider = document.getElementById('treble-slider');
    const trebleVal = document.getElementById('treble-val');
    const presetChips = document.querySelectorAll('.preset-chip');

    // Device & Telemetry
    const scanBtBtn = document.getElementById('scan-bt-btn');
    const currentDeviceName = document.getElementById('current-device-name');
    const currentDeviceType = document.getElementById('current-device-type');
    const renameDeviceBtn = document.getElementById('rename-device-btn');
    const fleetCount = document.getElementById('fleet-count');
    const fleetList = document.getElementById('fleet-list');

    // Modals
    const modalOverlay = document.getElementById('speaker-modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalAudioScanBtn = document.getElementById('modal-audio-scan-btn');
    const modalWebScanBtn = document.getElementById('modal-web-scan-btn');
    const speakerListContainer = document.getElementById('speaker-list-container');
    const versionChipBtn = document.getElementById('version-chip-btn');
    const footerVersionBtn = document.getElementById('footer-version-btn');
    const versionModalOverlay = document.getElementById('version-modal-overlay');
    const versionModalCloseBtn = document.getElementById('version-modal-close-btn');
    const footerLegalBtn = document.getElementById('footer-legal-btn');
    const legalModalOverlay = document.getElementById('legal-modal-overlay');
    const legalModalCloseBtn = document.getElementById('legal-modal-close-btn');
    const hardwareAudioElement = document.getElementById('hardware-audio-element');

    // ===== Application State =====
    let currentRole = 'host'; // 'host' or 'satellite'
    let roomCode = generateRoomCode();
    let isPlaying = false;
    let isMuted = false;
    let previousVolume = 75;
    let currentSource = 'synth'; // 'synth', 'file', 'mic'
    let loadedAudioBuffer = null;
    let activeAudioSourceNode = null;
    let micStream = null;
    let micSourceNode = null;
    let synthLoopTimer = null;
    let isTestingPhase = false;
    let testPhaseTimer = null;
    let satelliteDelayMs = 0;
    let currentChannel = 'stereo'; // 'stereo', 'left', 'right', 'mono'

    // Connected Fleet State (PartySync Telemetry)
    const fleetNodes = new Map();

    // ===== Web Audio API DSP Nodes =====
    let audioCtx = null;
    let masterGainNode = null;
    let delayNode = null;
    let pannerNode = null;
    let bassFilter = null;
    let trebleFilter = null;
    let analyserNode = null;
    let dataArray = null;

    // Silent carrier WAV (1 sample base64) para mantener la sesión de medios abierta
    const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

    // ===== P2P Synchronization Channel (BroadcastChannel + WebRTC) =====
    const syncChannel = new BroadcastChannel('partysync_mesh_v2');

    function initWebAudioEngine() {
        if (!audioCtx) {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    audioCtx = new AudioContextClass();

                    // Master Gain
                    masterGainNode = audioCtx.createGain();
                    masterGainNode.gain.setValueAtTime(Number(volumeSlider ? volumeSlider.value : 75) / 100, audioCtx.currentTime);

                    // Delay Node para Compensación de Latencia Milimétrica (Satélites)
                    delayNode = audioCtx.createDelay(1.0);
                    delayNode.delayTime.setValueAtTime(satelliteDelayMs / 1000, audioCtx.currentTime);

                    // Stereo Panner Node para Asignación L / R
                    if (audioCtx.createStereoPanner) {
                        pannerNode = audioCtx.createStereoPanner();
                        pannerNode.pan.setValueAtTime(0, audioCtx.currentTime);
                    }

                    // DSP Equalizer: Bass (lowshelf 200 Hz) y Treble (highshelf 3 kHz)
                    bassFilter = audioCtx.createBiquadFilter();
                    bassFilter.type = 'lowshelf';
                    bassFilter.frequency.setValueAtTime(200, audioCtx.currentTime);
                    bassFilter.gain.setValueAtTime(Number(bassSlider ? bassSlider.value : 6), audioCtx.currentTime);

                    trebleFilter = audioCtx.createBiquadFilter();
                    trebleFilter.type = 'highshelf';
                    trebleFilter.frequency.setValueAtTime(3000, audioCtx.currentTime);
                    trebleFilter.gain.setValueAtTime(Number(trebleSlider ? trebleSlider.value : 3), audioCtx.currentTime);

                    // Analyser Node FFT para Visualizador
                    analyserNode = audioCtx.createAnalyser();
                    analyserNode.fftSize = 64;
                    const bufferLength = analyserNode.frequencyBinCount;
                    dataArray = new Uint8Array(bufferLength);

                    // Conexión física en serie: Delay -> Panner -> Bass -> Treble -> Analyser -> MasterGain -> Destination
                    if (pannerNode) {
                        delayNode.connect(pannerNode);
                        pannerNode.connect(bassFilter);
                    } else {
                        delayNode.connect(bassFilter);
                    }
                    bassFilter.connect(trebleFilter);
                    trebleFilter.connect(analyserNode);
                    analyserNode.connect(masterGainNode);
                    masterGainNode.connect(audioCtx.destination);
                }
            } catch (e) {
                console.warn('Web Audio Engine no iniciado:', e);
            }
        }

        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // MediaSession integration
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'PartySync Pro — Cluster Multi-Parlante',
                artist: currentRole === 'host' ? '👑 Transmisor Host' : '📻 Satélite Parlante',
                album: `Sala ${roomCode}`,
                artwork: [
                    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => handleTogglePlay(true));
            navigator.mediaSession.setActionHandler('pause', () => handleTogglePlay(false));
        }

        if (hardwareAudioElement) {
            if (!hardwareAudioElement.src) hardwareAudioElement.src = SILENT_WAV;
            hardwareAudioElement.play().catch(() => {});
        }
    }

    // ===== Generador y Manejo de Salas PartySync =====
    function generateRoomCode() {
        return 'SYNC-' + Math.floor(1000 + Math.random() * 9000);
    }

    if (displayRoomCode) displayRoomCode.textContent = roomCode;

    // Verificar si hay código de sala en la URL (#room=SYNC-XXXX)
    if (window.location.hash && window.location.hash.includes('room=')) {
        const hashMatch = window.location.hash.match(/room=([A-Z0-9\-]+)/i);
        if (hashMatch && hashMatch[1]) {
            roomCode = hashMatch[1].toUpperCase();
            if (displayRoomCode) displayRoomCode.textContent = roomCode;
            if (satelliteRoomInput) satelliteRoomInput.value = roomCode;
            switchRole('satellite');
        }
    }

    if (btnCopyRoom) {
        btnCopyRoom.addEventListener('click', () => {
            const inviteUrl = `${window.location.origin}${window.location.pathname}#room=${roomCode}`;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(inviteUrl).then(() => {
                    const originalText = btnCopyRoom.textContent;
                    btnCopyRoom.textContent = '✅ ¡Enlace Copiado!';
                    setTimeout(() => { btnCopyRoom.textContent = originalText; }, 2500);
                }).catch(() => prompt('Copia este enlace de sala PartySync:', inviteUrl));
            } else {
                prompt('Copia este enlace de sala PartySync:', inviteUrl);
            }
        });
    }

    if (btnNewRoom) {
        btnNewRoom.addEventListener('click', () => {
            roomCode = generateRoomCode();
            if (displayRoomCode) displayRoomCode.textContent = roomCode;
            window.location.hash = `room=${roomCode}`;
            broadcastMeshMessage({ type: 'ROOM_UPDATE', roomCode });
            renderFleetTelemetry();
        });
    }

    // ===== Cambio de Roles: Host DJ vs Satélite =====
    function switchRole(role) {
        currentRole = role;
        initWebAudioEngine();

        if (role === 'host') {
            tabHostRole.classList.add('active');
            tabSatelliteRole.classList.remove('active');
            zoneHost.hidden = false;
            zoneSatellite.hidden = true;
            satelliteDelayMs = 0;
            if (delayNode && audioCtx) delayNode.delayTime.setValueAtTime(0, audioCtx.currentTime);
            if (pannerNode && audioCtx) pannerNode.pan.setValueAtTime(0, audioCtx.currentTime);
        } else {
            tabSatelliteRole.classList.add('active');
            tabHostRole.classList.remove('active');
            zoneSatellite.hidden = false;
            zoneHost.hidden = true;
            if (satelliteRoomInput && !satelliteRoomInput.value) {
                satelliteRoomInput.value = roomCode;
            }
        }
        renderFleetTelemetry();
    }

    if (tabHostRole) tabHostRole.addEventListener('click', () => switchRole('host'));
    if (tabSatelliteRole) tabSatelliteRole.addEventListener('click', () => switchRole('satellite'));

    // ===== Selección de Canal Espacial (Satélite) =====
    channelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            initWebAudioEngine();
            channelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentChannel = btn.dataset.channel;

            if (pannerNode && audioCtx) {
                if (currentChannel === 'left') pannerNode.pan.setValueAtTime(-1.0, audioCtx.currentTime);
                else if (currentChannel === 'right') pannerNode.pan.setValueAtTime(1.0, audioCtx.currentTime);
                else pannerNode.pan.setValueAtTime(0.0, audioCtx.currentTime);
            }

            broadcastMeshMessage({
                type: 'NODE_UPDATE',
                roomCode,
                nodeName: currentDeviceName.textContent,
                channel: currentChannel,
                delayMs: satelliteDelayMs
            });
            renderFleetTelemetry();
        });
    });

    // ===== Compensador de Latencia Milimétrica (Satélite) =====
    function updateSatelliteDelay(newDelayMs) {
        initWebAudioEngine();
        satelliteDelayMs = Math.max(0, Math.min(400, Number(newDelayMs)));
        if (delaySlider) delaySlider.value = satelliteDelayMs;
        if (delayValBadge) delayValBadge.textContent = `${satelliteDelayMs} ms`;

        if (delayNode && audioCtx) {
            delayNode.delayTime.setValueAtTime(satelliteDelayMs / 1000, audioCtx.currentTime);
        }

        broadcastMeshMessage({
            type: 'NODE_UPDATE',
            roomCode,
            nodeName: currentDeviceName.textContent,
            channel: currentChannel,
            delayMs: satelliteDelayMs
        });
        renderFleetTelemetry();
    }

    if (delaySlider) {
        delaySlider.addEventListener('input', (e) => updateSatelliteDelay(e.target.value));
    }

    delayStepBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const step = Number(btn.dataset.step);
            if (step === 0) updateSatelliteDelay(0);
            else updateSatelliteDelay(satelliteDelayMs + step);
        });
    });

    // ===== Fuentes de Audio (Host) =====
    sourceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            initWebAudioEngine();
            sourceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSource = btn.dataset.source;

            if (currentSource === 'file') {
                if (fileStatusRow) fileStatusRow.hidden = false;
                if (!loadedAudioBuffer && audioFileInput) audioFileInput.click();
            } else {
                if (fileStatusRow) fileStatusRow.hidden = true;
            }

            if (currentSource === 'mic') {
                startMicBroadcast();
            } else {
                stopMicBroadcast();
            }
        });
    });

    if (btnChooseFile && audioFileInput) {
        btnChooseFile.addEventListener('click', () => audioFileInput.click());
    }

    if (audioFileInput) {
        audioFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            initWebAudioEngine();
            loadedFileName.textContent = `⏳ Cargando ${file.name}...`;

            try {
                const arrayBuffer = await file.arrayBuffer();
                loadedAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                loadedFileName.textContent = `🎵 ${file.name} (${Math.round(loadedAudioBuffer.duration)}s)`;
                if (timeTotal) timeTotal.textContent = formatTime(loadedAudioBuffer.duration);
            } catch (err) {
                console.error('Error decodificando audio:', err);
                loadedFileName.textContent = '❌ Error al cargar archivo';
            }
        });
    }

    // ===== Micrófono / Megáfono en Vivo =====
    async function startMicBroadcast() {
        initWebAudioEngine();
        try {
            if (!micStream) {
                micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                micSourceNode = audioCtx.createMediaStreamSource(micStream);
                micSourceNode.connect(delayNode);
                isPlaying = true;
                if (btnPlayPause) btnPlayPause.textContent = '⏸️';
                broadcastMeshMessage({ type: 'PLAY_STATE', roomCode, isPlaying: true, source: 'mic' });
            }
        } catch (e) {
            console.warn('Micrófono no permitido o error:', e);
            alert('Permiso de micrófono requerido para el modo Megáfono.');
        }
    }

    function stopMicBroadcast() {
        if (micSourceNode) {
            try { micSourceNode.disconnect(); } catch (e) {}
            micSourceNode = null;
        }
        if (micStream) {
            micStream.getTracks().forEach(t => t.stop());
            micStream = null;
        }
    }

    // ===== Sintetizador de Ritmos Party Groove (128 BPM) =====
    // Generador de música electrónica sintética en tiempo real sin dependencias de archivos
    function playPartySynthGroove(beatIndex, startTime) {
        if (!audioCtx || !isPlaying || currentSource !== 'synth') return;

        // 128 BPM -> 16th note = 60 / (128 * 4) = 0.1171875s
        const stepTime = 60 / (128 * 4);

        // 1. Kick Drum (cada 4 pasos: 0, 4, 8, 12)
        if (beatIndex % 4 === 0) {
            const kickOsc = audioCtx.createOscillator();
            const kickGain = audioCtx.createGain();
            kickOsc.frequency.setValueAtTime(140, startTime);
            kickOsc.frequency.exponentialRampToValueAtTime(42, startTime + 0.08);

            kickGain.gain.setValueAtTime(0.7, startTime);
            kickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

            kickOsc.connect(kickGain);
            kickGain.connect(delayNode);
            kickOsc.start(startTime);
            kickOsc.stop(startTime + 0.19);
        }

        // 2. Snare / Clap (pasos 4 y 12)
        if (beatIndex % 8 === 4) {
            const snareOsc = audioCtx.createOscillator();
            const snareGain = audioCtx.createGain();
            snareOsc.type = 'triangle';
            snareOsc.frequency.setValueAtTime(220, startTime);

            snareGain.gain.setValueAtTime(0.3, startTime);
            snareGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

            snareOsc.connect(snareGain);
            snareGain.connect(delayNode);
            snareOsc.start(startTime);
            snareOsc.stop(startTime + 0.13);
        }

        // 3. Hi-Hat (cada 2 pasos: 2, 6, 10, 14)
        if (beatIndex % 2 === 1) {
            const hatOsc = audioCtx.createOscillator();
            const hatGain = audioCtx.createGain();
            hatOsc.type = 'square';
            hatOsc.frequency.setValueAtTime(8000, startTime);

            hatGain.gain.setValueAtTime(0.08, startTime);
            hatGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);

            hatOsc.connect(hatGain);
            hatGain.connect(delayNode);
            hatOsc.start(startTime);
            hatOsc.stop(startTime + 0.05);
        }

        // 4. Bassline melódica rodante
        const bassNotes = [55, 55, 65.4, 73.4, 55, 82.4, 73.4, 65.4];
        const currentNote = bassNotes[(beatIndex >> 1) % bassNotes.length];
        const bassOsc = audioCtx.createOscillator();
        const bassGain = audioCtx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(currentNote, startTime);

        bassGain.gain.setValueAtTime(0.18, startTime);
        bassGain.gain.exponentialRampToValueAtTime(0.001, startTime + stepTime * 1.5);

        bassOsc.connect(bassGain);
        bassGain.connect(delayNode);
        bassOsc.start(startTime);
        bassOsc.stop(startTime + stepTime * 1.6);
    }

    let synthStepCounter = 0;
    let nextStepTime = 0;

    function scheduleSynthGroove() {
        if (!isPlaying || currentSource !== 'synth' || !audioCtx) return;

        const scheduleAhead = 0.2;
        while (nextStepTime < audioCtx.currentTime + scheduleAhead) {
            playPartySynthGroove(synthStepCounter, nextStepTime);
            nextStepTime += (60 / (128 * 4));
            synthStepCounter = (synthStepCounter + 1) % 64;
        }

        synthLoopTimer = requestAnimationFrame(scheduleSynthGroove);
    }

    // ===== Reproducción de Archivo Local Sincronizado =====
    function playLoadedAudioFile(offsetSeconds = 0) {
        if (!audioCtx || !loadedAudioBuffer) return;
        stopActiveAudio();

        activeAudioSourceNode = audioCtx.createBufferSource();
        activeAudioSourceNode.buffer = loadedAudioBuffer;
        activeAudioSourceNode.connect(delayNode);
        activeAudioSourceNode.start(0, offsetSeconds);

        activeAudioSourceNode.onended = () => {
            if (isPlaying && currentSource === 'file') {
                handleTogglePlay(false);
            }
        };
    }

    function stopActiveAudio() {
        if (activeAudioSourceNode) {
            try { activeAudioSourceNode.stop(); } catch (e) {}
            activeAudioSourceNode = null;
        }
        if (synthLoopTimer) {
            cancelAnimationFrame(synthLoopTimer);
            synthLoopTimer = null;
        }
    }

    // ===== Play / Pause Maestro =====
    function handleTogglePlay(shouldPlay = null) {
        initWebAudioEngine();
        isPlaying = (shouldPlay !== null) ? shouldPlay : !isPlaying;

        if (btnPlayPause) btnPlayPause.textContent = isPlaying ? '⏸️' : '▶️';

        if (isPlaying) {
            if (currentSource === 'synth') {
                nextStepTime = audioCtx.currentTime + 0.05;
                scheduleSynthGroove();
            } else if (currentSource === 'file') {
                playLoadedAudioFile(0);
            } else if (currentSource === 'mic') {
                startMicBroadcast();
            }
        } else {
            stopActiveAudio();
            stopMicBroadcast();
        }

        // Emitir a toda la flota PartySync
        broadcastMeshMessage({
            type: 'PLAY_STATE',
            roomCode,
            isPlaying,
            source: currentSource,
            timestamp: Date.now()
        });
    }

    if (btnPlayPause) btnPlayPause.addEventListener('click', () => handleTogglePlay());
    if (btnPrev) btnPrev.addEventListener('click', () => { synthStepCounter = 0; });
    if (btnNext) btnNext.addEventListener('click', () => { synthStepCounter = 32; });

    // ===== Test Armónico de Fase (Para Alinear Eco de Parlantes) =====
    function playPhaseTestTone() {
        initWebAudioEngine();
        if (isTestingPhase) {
            stopPhaseTest();
            return;
        }

        isTestingPhase = true;
        if (btnTestTone) {
            btnTestTone.classList.add('active');
            btnTestTone.textContent = '⏹️ Parar Test';
        }

        // Tono rítmico metronómico (Pulso a 880 Hz cada 500 ms) para alinear al oído
        function triggerPulse() {
            if (!isTestingPhase || !audioCtx) return;
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.frequency.setValueAtTime(880, audioCtx.currentTime);
            g.gain.setValueAtTime(0.35, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

            osc.connect(g);
            g.connect(delayNode);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.11);

            testPhaseTimer = setTimeout(triggerPulse, 500);
        }
        triggerPulse();

        // Notificar a los satélites para que todos reproduzcan el pulso
        broadcastMeshMessage({ type: 'TEST_PHASE', roomCode, active: true });
    }

    function stopPhaseTest() {
        isTestingPhase = false;
        if (testPhaseTimer) clearTimeout(testPhaseTimer);
        if (btnTestTone) {
            btnTestTone.classList.remove('active');
            btnTestTone.textContent = '🎵 Test de Fase';
        }
        broadcastMeshMessage({ type: 'TEST_PHASE', roomCode, active: false });
    }

    if (btnTestTone) btnTestTone.addEventListener('click', playPhaseTestTone);

    // ===== Mensajería de la Red P2P Mesh (PartySync Protocol) =====
    function broadcastMeshMessage(payload) {
        try {
            syncChannel.postMessage(payload);
        } catch (e) {
            console.warn('Error broadcasting mesh message:', e);
        }
    }

    syncChannel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || msg.roomCode !== roomCode) return;

        switch (msg.type) {
            case 'PLAY_STATE':
                if (currentRole === 'satellite') {
                    if (msg.isPlaying !== isPlaying) {
                        handleTogglePlay(msg.isPlaying);
                    }
                }
                break;
            case 'TEST_PHASE':
                if (currentRole === 'satellite') {
                    if (msg.active && !isTestingPhase) playPhaseTestTone();
                    else if (!msg.active && isTestingPhase) stopPhaseTest();
                }
                break;
            case 'NODE_UPDATE':
            case 'JOIN_ROOM':
                fleetNodes.set(msg.nodeName, {
                    name: msg.nodeName,
                    role: msg.role || 'satellite',
                    channel: msg.channel || 'stereo',
                    delayMs: msg.delayMs || 0,
                    lastSeen: Date.now()
                });
                renderFleetTelemetry();
                break;
        }
    };

    // Botón de unión manual en satélite
    if (btnJoinRoom && satelliteRoomInput) {
        btnJoinRoom.addEventListener('click', () => {
            const entered = satelliteRoomInput.value.trim().toUpperCase();
            if (entered) {
                roomCode = entered;
                window.location.hash = `room=${roomCode}`;
                if (satStatusText) satStatusText.textContent = `🟢 Conectado al Cluster [${roomCode}]`;
                broadcastMeshMessage({
                    type: 'JOIN_ROOM',
                    roomCode,
                    nodeName: currentDeviceName.textContent,
                    role: 'satellite',
                    channel: currentChannel,
                    delayMs: satelliteDelayMs
                });
                renderFleetTelemetry();
            }
        });
    }

    // ===== Telemetría de la Flota (Radar de Parlantes Conectados) =====
    function renderFleetTelemetry() {
        if (!fleetList) return;
        fleetList.innerHTML = '';

        // Nodo propio siempre visible
        const selfItem = document.createElement('div');
        selfItem.className = 'fleet-node master-node';
        const roleLabel = currentRole === 'host' ? '👑 HOST' : '📻 SATÉLITE';
        const badgeClass = currentRole === 'host' ? 'node-badge' : 'node-badge satellite-badge';
        selfItem.innerHTML = `
            <div class="node-left">
                <span class="${badgeClass}">${roleLabel}</span>
                <div>
                    <strong class="node-name">${currentDeviceName.textContent}</strong>
                    <small class="node-sub">Canal: ${currentChannel.toUpperCase()} • Delay: ${satelliteDelayMs} ms (Este equipo)</small>
                </div>
            </div>
            <span class="node-ping">🟢 Local 0 ms</span>
        `;
        fleetList.appendChild(selfItem);

        let count = 1;
        fleetNodes.forEach((node) => {
            if (node.name !== currentDeviceName.textContent) {
                count++;
                const item = document.createElement('div');
                item.className = 'fleet-node';
                item.innerHTML = `
                    <div class="node-left">
                        <span class="node-badge satellite-badge">📻 SATÉLITE</span>
                        <div>
                            <strong class="node-name">${node.name}</strong>
                            <small class="node-sub">Canal: ${node.channel.toUpperCase()} • Delay calibrado: +${node.delayMs} ms</small>
                        </div>
                    </div>
                    <span class="node-ping">🟢 En Fase (&lt; 2 ms)</span>
                `;
                fleetList.appendChild(item);
            }
        });

        if (fleetCount) fleetCount.textContent = `${count} ${count === 1 ? 'Nodo' : 'Nodos'}`;
    }

    // ===== Visualizador Espectral Reactivo FFT =====
    const canvas = document.getElementById('audio-visualizer');
    const ctx = canvas ? canvas.getContext('2d') : null;

    function drawVisualizer() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bars = 36;
        const barWidth = (canvas.width / bars) - 2;

        if (analyserNode && isPlaying && dataArray) {
            analyserNode.getByteFrequencyData(dataArray);
        }

        for (let i = 0; i < bars; i++) {
            let height = 4;
            if (isMuted) {
                height = 2;
            } else if (isPlaying && dataArray) {
                const freq = dataArray[i] || 0;
                height = Math.max(4, (freq / 255) * (canvas.height * 0.9));
            } else {
                height = Math.max(3, Math.sin(Date.now() / 300 + i * 0.4) * 5 + 6);
            }

            const x = i * (barWidth + 2);
            const y = canvas.height - height;

            const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
            grad.addColorStop(0, '#6C5CE7');
            grad.addColorStop(0.5, '#00CEC9');
            grad.addColorStop(1, '#FF007F');
            ctx.fillStyle = grad;
            ctx.fillRect(x, y, barWidth, height);
        }
        requestAnimationFrame(drawVisualizer);
    }
    drawVisualizer();

    // ===== Controles de Volumen y Ecualizador Físico =====
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const val = Number(e.target.value);
            if (volPercentDisplay) volPercentDisplay.textContent = `${val}%`;
            isMuted = (val === 0);
            if (btnMuteToggle) btnMuteToggle.textContent = isMuted ? '🔇' : '🔊';

            initWebAudioEngine();
            if (masterGainNode && audioCtx) {
                masterGainNode.gain.setValueAtTime(val / 100, audioCtx.currentTime);
            }
            if (hardwareAudioElement) hardwareAudioElement.volume = val / 100;
        });
    }

    if (btnMuteToggle) {
        btnMuteToggle.addEventListener('click', () => {
            initWebAudioEngine();
            isMuted = !isMuted;
            if (isMuted) {
                previousVolume = volumeSlider.value;
                volumeSlider.value = 0;
                volPercentDisplay.textContent = '0%';
                btnMuteToggle.textContent = '🔇';
                if (masterGainNode && audioCtx) masterGainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            } else {
                volumeSlider.value = previousVolume > 0 ? previousVolume : 75;
                volPercentDisplay.textContent = `${volumeSlider.value}%`;
                btnMuteToggle.textContent = '🔊';
                if (masterGainNode && audioCtx) masterGainNode.gain.setValueAtTime(Number(volumeSlider.value) / 100, audioCtx.currentTime);
            }
        });
    }

    if (btnMaxVol) {
        btnMaxVol.addEventListener('click', () => {
            initWebAudioEngine();
            volumeSlider.value = 100;
            volPercentDisplay.textContent = '100%';
            isMuted = false;
            if (btnMuteToggle) btnMuteToggle.textContent = '🔊';
            if (masterGainNode && audioCtx) masterGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
        });
    }

    function updateEqDsp() {
        initWebAudioEngine();
        if (bassFilter && audioCtx) {
            bassFilter.gain.setValueAtTime(Number(bassSlider.value), audioCtx.currentTime);
        }
        if (trebleFilter && audioCtx) {
            trebleFilter.gain.setValueAtTime(Number(trebleSlider.value), audioCtx.currentTime);
        }
    }

    if (bassSlider) {
        bassSlider.addEventListener('input', (e) => {
            if (bassVal) bassVal.textContent = `+${e.target.value} dB`;
            updateEqDsp();
        });
    }

    if (trebleSlider) {
        trebleSlider.addEventListener('input', (e) => {
            if (trebleVal) trebleVal.textContent = `+${e.target.value} dB`;
            updateEqDsp();
        });
    }

    // Presets DSP
    const eqPresets = {
        flat: { bass: 0, treble: 0 },
        bass: { bass: 6, treble: 2 },
        vocal: { bass: 1, treble: 4 },
        club: { bass: 12, treble: 6 }
    };

    presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
            presetChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const p = eqPresets[chip.dataset.preset];
            if (p) {
                if (bassSlider) { bassSlider.value = p.bass; if (bassVal) bassVal.textContent = `+${p.bass} dB`; }
                if (trebleSlider) { trebleSlider.value = p.treble; if (trebleVal) trebleVal.textContent = `+${p.treble} dB`; }
                updateEqDsp();
            }
        });
    });

    // ===== Renombrado de Parlante Local =====
    if (renameDeviceBtn) {
        renameDeviceBtn.addEventListener('click', () => {
            const newName = prompt('Nombre de tu parlante en este dispositivo:', currentDeviceName.textContent);
            if (newName && newName.trim()) {
                currentDeviceName.textContent = newName.trim();
                localStorage.setItem('partysync_device_name', newName.trim());
                renderFleetTelemetry();
            }
        });
    }

    const savedDeviceName = localStorage.getItem('partysync_device_name');
    if (savedDeviceName) currentDeviceName.textContent = savedDeviceName;

    // ===== Scanner de Parlantes y Modales =====
    function toggleModal(el, show) { if (el) el.hidden = !show; }

    if (versionChipBtn) versionChipBtn.addEventListener('click', () => toggleModal(versionModalOverlay, true));
    if (footerVersionBtn) footerVersionBtn.addEventListener('click', () => toggleModal(versionModalOverlay, true));
    if (versionModalCloseBtn) versionModalCloseBtn.addEventListener('click', () => toggleModal(versionModalOverlay, false));
    if (versionModalOverlay) versionModalOverlay.addEventListener('click', (e) => { if (e.target === versionModalOverlay) toggleModal(versionModalOverlay, false); });

    if (footerLegalBtn) footerLegalBtn.addEventListener('click', () => toggleModal(legalModalOverlay, true));
    if (legalModalCloseBtn) legalModalCloseBtn.addEventListener('click', () => toggleModal(legalModalOverlay, false));
    if (legalModalOverlay) legalModalOverlay.addEventListener('click', (e) => { if (e.target === legalModalOverlay) toggleModal(legalModalOverlay, false); });

    if (scanBtBtn) scanBtBtn.addEventListener('click', () => toggleModal(modalOverlay, true));
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => toggleModal(modalOverlay, false));
    if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) toggleModal(modalOverlay, false); });

    // Scanner de audio del sistema
    async function scanSystemAudioOutputs() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true }).then(s => s.getTracks().forEach(t => t.stop())).catch(() => {});
            const devices = await navigator.mediaDevices.enumerateDevices();
            const outputs = devices.filter(d => d.kind === 'audiooutput');

            if (outputs.length > 0 && speakerListContainer) {
                speakerListContainer.innerHTML = '';
                outputs.forEach(dev => {
                    const label = dev.label || `Parlante / Salida (${dev.deviceId.substring(0, 6)})`;
                    const item = document.createElement('div');
                    item.className = 'speaker-item';
                    item.innerHTML = `
                        <div class="speaker-item-info">
                            <span class="speaker-item-name">🔊 ${label}</span>
                            <span class="speaker-item-type">Salida de Audio del Sistema / Bluetooth</span>
                        </div>
                        <button type="button" class="btn-connect-speaker">🔗 Seleccionar</button>
                    `;
                    item.querySelector('.btn-connect-speaker').addEventListener('click', () => {
                        currentDeviceName.textContent = label;
                        if (currentDeviceType) currentDeviceType.textContent = '✅ Salida física seleccionada';
                        toggleModal(modalOverlay, false);
                        renderFleetTelemetry();
                    });
                    speakerListContainer.appendChild(item);
                });
            }
        } catch (e) {}
    }

    if (modalAudioScanBtn) modalAudioScanBtn.addEventListener('click', scanSystemAudioOutputs);

    // Helpers
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // PWA Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }

    // Inicializar telemetría de flota
    renderFleetTelemetry();
});
