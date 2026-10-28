# VOID.AI — Native Android Build

This project is now configured for Capacitor. Because generating the `android/`
platform folder requires downloading Capacitor's Android template from npm
(network access), it is **not** physically included in this ZIP — it gets
generated automatically the first time the GitHub Actions workflow runs.

## What's included
- `@capacitor/core`, `@capacitor/android`, `@capacitor/cli` added to `package.json`
- `capacitor.config.ts` — appId `com.voidai.app`, appName `VOID.AI`, `webDir: dist`,
  no `server.url` set so the app loads the built `dist/` bundle locally (offline)
- `.github/workflows/android-build.yml` — CI pipeline that:
  1. `npm install`
  2. `npm run build` (Vite build → `dist/`)
  3. `npx cap add android` (generates the native project, first run only)
  4. `npx cap sync android`
  5. `./gradlew assembleDebug`
  6. Uploads `app-debug.apk` as a workflow artifact

## To build the APK
1. Push this project to a GitHub repo.
2. Go to **Actions → Build Android APK → Run workflow** (or just push to `main`).
3. Download `void-ai-debug-apk` from the completed run's artifacts.

## To generate the `android/` folder locally instead
```bash
npm install
npm run build
npx cap add android
npx cap sync android
```
After this runs once, commit the resulting `android/` folder if you want it
version-controlled (the workflow will detect it and skip re-adding it).

## Note on the Gemini API
`server.ts` currently proxies Gemini calls through an Express backend. A
native app has no Node server bundled with it — if you need live AI replies
on-device, you'll want to call the Gemini API directly from the client (using
`customApiKey` from API Settings) or point the app at a deployed instance of
`server.ts`. Right now, offline the app will fall back to the local responses
already built into `server.ts`'s fallback logic.
