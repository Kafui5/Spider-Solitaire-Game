// Generate silent WAV stub files for all game sounds.
// Run: node scripts/generate-silence.js

const fs = require('fs');
const path = require('path');

const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(soundsDir, { recursive: true });

const sounds = [
  'card_pickup',
  'card_drop',
  'card_error',
  'run_complete',
  'stock_deal',
  'win_celebration',
];

// Minimal valid WAV file: 44-byte header + 0 bytes of audio data = silence
const header = Buffer.from([
  0x52, 0x49, 0x46, 0x46, // "RIFF"
  0x24, 0x00, 0x00, 0x00, // File size - 8 (36 bytes)
  0x57, 0x41, 0x56, 0x45, // "WAVE"
  0x66, 0x6D, 0x74, 0x20, // "fmt "
  0x10, 0x00, 0x00, 0x00, // Subchunk1 size (16)
  0x01, 0x00,             // Audio format (PCM)
  0x01, 0x00,             // Channels (mono)
  0x44, 0xAC, 0x00, 0x00, // Sample rate (44100)
  0x88, 0x58, 0x01, 0x00, // Byte rate (88200)
  0x02, 0x00,             // Block align (2)
  0x10, 0x00,             // Bits per sample (16)
  0x64, 0x61, 0x74, 0x61, // "data"
  0x00, 0x00, 0x00, 0x00, // Data size (0 = silence)
]);

for (const sound of sounds) {
  const filePath = path.join(soundsDir, `${sound}.wav`);
  fs.writeFileSync(filePath, header);
  console.log(`Created: ${filePath}`);
}

console.log(`\nDone! ${sounds.length} silent WAV stubs created.`);
console.log('Replace these with real sound effects before launch.');
