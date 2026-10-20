# PWA build

This is a static installable web application. It needs no backend or database.

## Quick preview

Open `index.html` in a modern browser to inspect the layout. Some browser features (install prompt and offline service-worker caching) are only available when served from HTTPS or `localhost`.

## Install on Android

1. Upload the **contents** of this folder to a static HTTPS host.
2. Open the URL in Chrome on Android.
3. Choose **Install app** or **Add to Home screen** from Chrome's menu.
4. Open the app once while connected so its core content is cached. The guide and checklists then work offline.

The PWA includes the PDF itself and an extracted English text reader. The Persian and English summaries for all 12 main sections are built into `app.js`.
