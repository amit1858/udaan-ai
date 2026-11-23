import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = (await fs.readdir(path.join(root, 'source'))).filter(f => /^\d{2}-.+\.svg$/.test(f)).sort();
if (files.length !== 7) throw new Error(`Expected seven carousel sources, got ${files.length}`);
for (const folder of ['slides', 'previews']) await fs.mkdir(path.join(root, folder), { recursive: true });
const thumbs = [];
for (const [i, file] of files.entries()) {
  const buffer = await fs.readFile(path.join(root, 'source', file));
  const name = file.replace('.svg', '.png');
  await sharp(buffer, { density: 144 }).png().toFile(path.join(root, 'slides', name));
  const preview = await sharp(buffer).resize(432, 540).png().toBuffer();
  thumbs.push({ input: preview, left: (i % 4) * 456 + 24, top: Math.floor(i / 4) * 580 + 24 });
}
await sharp({ create: { width: 1848, height: 1164, channels: 4, background: '#182338' } }).composite(thumbs).png().toFile(path.join(root, 'previews', 'carousel-contact-sheet.png'));
await sharp(path.join(root, 'source', 'linkedin-cover.svg'), { density: 144 }).png().toFile(path.join(root, 'linkedin-cover.png'));
execFileSync(process.env.PYTHON || 'python', [path.join(root, 'tools', 'export_pdf.py')], { cwd: root, stdio: 'inherit' });
console.log('Exported seven 2160×2700 PNG slides, cover, contact sheet, carousel PDF and storyboard PDF.');
