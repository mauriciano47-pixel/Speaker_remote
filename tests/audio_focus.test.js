// SPEAKER REMOTE - Suite de Pruebas Unitarias: Audio Focus & Interrupción de Audio
const test = require('node:test');
const assert = require('node:assert/strict');

const AUDIO_FOCUS_STATES = {
  GAIN: 'AUDIOFOCUS_GAIN',
  LOSS_TRANSIENT_CAN_DUCK: 'AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK',
  LOSS_TRANSIENT: 'AUDIOFOCUS_LOSS_TRANSIENT',
  LOSS: 'AUDIOFOCUS_LOSS'
};

function handleAudioFocusChange(focusChange, currentVolume) {
  switch (focusChange) {
    case AUDIO_FOCUS_STATES.GAIN:
      return { action: 'resume', targetGain: currentVolume / 100, isPlaying: true };
    case AUDIO_FOCUS_STATES.LOSS_TRANSIENT_CAN_DUCK:
      return { action: 'duck', targetGain: (currentVolume / 100) * 0.2, isPlaying: true };
    case AUDIO_FOCUS_STATES.LOSS_TRANSIENT:
      return { action: 'pause_temporary', targetGain: 0, isPlaying: false };
    case AUDIO_FOCUS_STATES.LOSS:
      return { action: 'stop_permanent', targetGain: 0, isPlaying: false };
    default:
      return { action: 'noop', targetGain: currentVolume / 100, isPlaying: true };
  }
}

test('Audio Focus - Responde con atenuación (ducking) ante llamadas o notificaciones', () => {
  const result = handleAudioFocusChange(AUDIO_FOCUS_STATES.LOSS_TRANSIENT_CAN_DUCK, 80);
  assert.strictEqual(result.action, 'duck');
  assert.strictEqual(result.isPlaying, true);
  assert.strictEqual(result.targetGain.toFixed(2), '0.16');
});

test('Audio Focus - Restaura ganancia normal al recuperar el foco de audio', () => {
  const result = handleAudioFocusChange(AUDIO_FOCUS_STATES.GAIN, 80);
  assert.strictEqual(result.action, 'resume');
  assert.strictEqual(result.isPlaying, true);
  assert.strictEqual(result.targetGain, 0.8);
});

test('Audio Focus - Pausa ante pérdida transitoria y detiene ante pérdida permanente', () => {
  const transient = handleAudioFocusChange(AUDIO_FOCUS_STATES.LOSS_TRANSIENT, 80);
  assert.strictEqual(transient.action, 'pause_temporary');
  assert.strictEqual(transient.isPlaying, false);

  const permanent = handleAudioFocusChange(AUDIO_FOCUS_STATES.LOSS, 80);
  assert.strictEqual(permanent.action, 'stop_permanent');
  assert.strictEqual(permanent.isPlaying, false);
});
