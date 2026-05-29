const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE = 'https://it.orb.ru';
const ASSETS_DIR = 'C:\\neww\\public\\assets';

const files = [
  '/assets/components/modxminify/cache/styles-2-1707309042.min.css',
  '/assets/styles/css/main.css',
  '/assets/styles/css/edits.css',
  '/assets/styles/css/company.css',
  '/assets/styles/css/company-page.css',
  '/assets/styles/css/jquery.fancybox.min.css',
  '/assets/styles/css/meryPodderzhki-page.css',
  '/upload/base/logotip-new-white.svg',
  '/assets/images/tg.svg',
  '/assets/images/elena.png',
  '/assets/images/image 1404.png',
  '/assets/images/olesia.png',
  '/assets/images/qr-code.png',
  '/assets/images/qr-code (1).png',
  '/assets/images/money.svg',
  '/assets/images/calendar3.png',
  '/favicon.ico',
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => { fs.unlink(dest); reject(err); });
  });
}

(async () => {
  for (const f of files) {
    const dest = path.join(ASSETS_DIR, f.replace('/assets/', ''));
    console.log('Downloading', f);
    await download(BASE + f, dest);
  }
  console.log('All done');
})();
