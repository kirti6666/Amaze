# Barakah Giving: Android UI demo

A clickable Android app demo for a donation and fundraising platform (Tooba-style layout, Milaap-style flows).
All data is sample data held in memory. There is no backend, and no real payments are made.

## What's in the demo

| Tab / screen | Covers |
|---|---|
| Login | Phone + OTP, email/Google, donor or organiser role, guest mode |
| Campaigns | Category filters, favorites, campaign cards (goal, raised, progress, share, donate) |
| Search | Text search, Zakat-only filter, sort by ending soon / nearly funded / newest |
| Campaign page | Story, beneficiary details, verified documents, updates, donors, comments, WhatsApp share |
| Donate | Amount chips, Sadaqah / Zakat / Lillah, anonymous, optional platform tip, UPI / card / net banking, receipt |
| Completed | Closed campaigns and a "where the money went" report for each |
| Rating | Leagues, Kindness Points, leaderboards for leaders, donors and inspirers |
| News | Impact videos, campaign updates, notifications |
| Profile | Ranks, donations, streak, achievements, settings, About / How it works / FAQ / Contact / policy pages |
| Start a fundraiser | 4-step form with real photo/document pickers, submit for review |
| Dashboard | My fundraisers, donations received, "approve as admin" demo button, withdrawals with status tracking, KYC and bank account |
| Settings | Profile details, PAN for 80G receipts, email notification preferences, verified NGO list |
| Admin panel (desktop preview only) | Overview, fundraiser review (approve / reject / suspend), verification, withdrawals, donations and reports, users, categories, website content, fees and settings |

## Preview on a desktop

Double-click `desktop-preview.html`. It shows the app in a phone frame with a screen list and the scope checklist, plus an **Admin panel** mode.
After changing anything in `www/`, run `npm run preview` to rebuild it.

## Build the APK

**GitHub Actions:** every push that touches `fundraiser-app/` runs `.github/workflows/fundraiser-apk.yml`.
Download `barakah-demo-apk` from the run's Artifacts section and install `app-debug.apk` on the phone.

**Locally** (needs Node 22+, JDK 21 and Android Studio):

```bash
cd fundraiser-app
npm ci
npx cap add android      # first time only; the android/ folder is not committed
npx cap sync android
cd android && ./gradlew assembleDebug   # APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## Changing things

- Brand name: `APP` in `www/app.js`, `appName` in `capacitor.config.json`.
- Colours: the tokens at the top of `www/app.css`.
- Campaigns, NGOs and amounts: the `CAMPAIGNS` and `ORGS` arrays in `www/app.js`. Add `photo: 'img/file.jpg'` to a campaign to use a real photo instead of the illustrated cover.
