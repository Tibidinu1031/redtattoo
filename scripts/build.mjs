import { mkdir, copyFile, readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.resolve(root, 'dist');
// The build owns only this exact child directory.
if (path.dirname(output) !== path.resolve(root) || path.basename(output) !== 'dist') throw new Error('Invalid output directory');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const dataScript = await readFile(path.join(root, 'assets/gallery-data.js'), 'utf8');
const photos = JSON.parse(dataScript.slice(dataScript.indexOf('['), dataScript.lastIndexOf(']') + 1));
const usedAssets = new Set([
  'assets/gallery-data.js',
  ...photos.map(photo => photo.src),
  ...[...html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)].map(match => match[1])
]);
for (const file of ['index.html', 'styles.css', 'app.js', '.nojekyll', ...usedAssets]) {
  const source = path.resolve(root, file);
  const destination = path.resolve(output, file);
  if (!source.startsWith(path.resolve(root) + path.sep) || !destination.startsWith(output + path.sep)) throw new Error('Asset path outside project');
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}
console.log('Build: dist/index.html; ' + (usedAssets.size - 1) + ' imagini locale. Sursa rămâne în rădăcină.');
