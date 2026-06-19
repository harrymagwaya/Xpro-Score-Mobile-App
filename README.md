# Xpro-Score-Mobile-App
Xpro Score App is a React Native / Expo mobile application for viewing tenant credit score information, borrowing power, financial health, records, tenancy status, and profile details.

## App Preview

Add your screenshot here:

```markdown
![Xpro Score App Screenshot](./assets/screenshots/xpro-score-home.png)
````

Make sure the screenshot is saved inside the project, for example:

```text
assets/screenshots/xpro-score-home.png
```

## Disclaimer

This app is a frontend/mobile shell for demonstration and testing. Some features depend on a connected API service. If the service is unavailable, some screens may not load live data, login may fail, or some actions may not complete.

The app can still be opened and reviewed as a mobile interface.

## Requirements

Before running the app, install:

```text
Node.js
npm
Expo Go app on your phone
```

Optional, if you want to run on an emulator:

```text
Android Studio
Android Emulator
```

## Important Package Manager Note

This repo contains:

```text
package-lock.json
```

and does not contain:

```text
yarn.lock
```

So use **npm commands** for this project.

Do not use `yarn install` unless you intentionally want to switch the project to Yarn.

## Install Dependencies

Open the project folder in your terminal and run:

```bash
npm install
```

## Start the App

Run:

```bash
npm run start
```

or:

```bash
npx expo start
```

Expo will start and show a QR code.

## Run on a Phone with Expo Go

1. Install **Expo Go** on your phone.
2. Start the app:

```bash
npm run start
```

3. Scan the QR code using Expo Go.
4. The app will open on your phone.

Your phone and computer should be on the same Wi-Fi network.

## Run on Android Emulator

Start your Android emulator first.

Then run:

```bash
npm run start
```

When Expo starts, press:

```text
a
```

This opens the app on the Android emulator.

## Run on Web

Run:

```bash
npx expo start --web
```

Or start Expo normally:

```bash
npm run start
```

Then press:

```text
w
```

Some mobile screens may look different on web.

## Clear Cache and Restart

If the app does not update correctly or shows old content, run:

```bash
npx expo start -c
```

## Common Commands

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm run start
```

Start Expo directly:

```bash
npx expo start
```

Start Expo with cleared cache:

```bash
npx expo start -c
```

Run on web:

```bash
npx expo start --web
```

Run on Android emulator:

```bash
npm run start
```

Then press:

```text
a
```

## Troubleshooting

### App does not start

Reinstall dependencies:

```bash
npm install
```

Then restart Expo with cache cleared:

```bash
npx expo start -c
```

### QR code does not open

Check that:

```text
Expo Go is installed on your phone
Your phone and computer are on the same Wi-Fi network
The Expo server is still running
```

### App opens but data does not load

Some screens depend on a live API service. If the service is unavailable, data may not appear.

### Android emulator does not open

Make sure Android Studio is installed and an emulator is running before pressing:

```text
a
```

### Dependency issues

Because this project uses `package-lock.json`, use:

```bash
npm install
```

Avoid mixing package managers. Do not run both `npm install` and `yarn install` in the same project unless you know what you are changing.

## Project Notes

Xpro Score App is designed for mobile use and works best through Expo Go or an Android emulator.

Main app areas include:

```text
Score dashboard
Borrowing power
Financial health
Records
Tenancy
Profile
```

````


```markdown
![Xpro Score App Screenshot](./assets/screenshots/xpro-score-home.png)
```
