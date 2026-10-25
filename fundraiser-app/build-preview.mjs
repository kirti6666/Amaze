// Builds desktop-preview.html: one self-contained file with the app (www/) in a phone frame plus the admin panel mock.
import { readFileSync, writeFileSync } from 'node:fs';

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8');
const css = read('./www/app.css');
// the preview is one self-contained file, so the sample photos are inlined as data URIs
const js = read('./www/app.js').replace(/'(img\/[\w-]+\.jpg)'/g, (_, f) => `'data:image/jpeg;base64,${readFileSync(new URL('./www/' + f, import.meta.url)).toString('base64')}'`);
// the app is embedded inside <script type="text/plain"> blocks, so it must never close a script tag itself
if (/<\/script/i.test(css + js)) throw new Error('www/ contains "</script", which would break the preview embed');

const html = read('./preview/shell.html').replace('{{APP_CSS}}', () => css).replace('{{APP_JS}}', () => js);
writeFileSync(new URL('./desktop-preview.html', import.meta.url), html);
console.log('wrote desktop-preview.html', (html.length / 1024).toFixed(0) + ' KB');
