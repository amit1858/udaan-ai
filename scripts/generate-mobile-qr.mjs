import QRCode from 'qrcode';
import { mkdir } from 'node:fs/promises';
const url = 'https://5d2ab9b6-290e-4024-b4bd-09459a94d4e4-00-vgmsxm4qfhmt.pike.replit.dev/';
await mkdir('generated-artifacts/mobile-qa', { recursive: true });
await QRCode.toFile('generated-artifacts/mobile-qa/udaan-mobile-preview-qr.png', url, {
  width: 720, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#05070D', light: '#FFFFFF' },
});
console.log('Created a QR code for the temporary HTTPS development preview. No credentials are embedded.');
