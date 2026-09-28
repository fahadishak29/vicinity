# Vicinity

Vicinity is a community coordination and emergency-response web app. Its static frontend is hosted with Firebase Hosting, with Firebase Functions for Firestore-triggered categorization and callable operations. A separate Flask service provides text classification and Gemini-powered analysis.

## Project layout

- `public/` - frontend pages, styles, and browser JavaScript
- `functions/` - Firebase Functions
- `ml-api/` - Flask machine-learning API
- `firestore.rules` - Firestore security rules
- `firebase.json` - Firebase Hosting and Functions configuration

## Requirements

- Node.js 18 or newer and npm
- Python 3.11 for the ML API
- Firebase CLI for local Hosting or Firebase deployment
- A Gemini API key for the Gemini analysis endpoints

The root `requirements.txt` combines dependencies for both Python services. The service-specific files in `ml-api/` and `functions/` are the deployment manifests for those services.

## Run the frontend

Install the Firebase CLI if it is not already installed, then start the Hosting emulator from the repository root:

```sh
npm install -g firebase-tools
firebase emulators:start --only hosting
```

Open the local URL printed by the emulator, usually `http://127.0.0.1:5000`. The root `package.json` currently has no start script; the Firebase Hosting emulator serves files from `public/` as configured in `firebase.json`.

## Run the ML API

From the repository root:

```sh
cd ml-api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The API listens on `http://localhost:5000` by default. Available endpoints:

- `GET /health` - service and model status
- `POST /predict` - classify text; JSON body: `{"text": "need clean drinking water"}`
- `POST /analyze` - analyze a prompt with Gemini; JSON body: `{"prompt": "..."}`
- `POST /analyze-image` - analyze a base64-encoded image; JSON body includes `image`

Set `GEMINI_API_KEY` in the service environment to use `/analyze` and `/analyze-image`. Do not put the key in frontend code or commit it to the repository.

## Deploy to Firebase

From the repository root, after configuring and authenticating the Firebase CLI for the intended project:

```sh
firebase deploy --only hosting
firebase deploy --only functions
```

Review `firestore.rules` and configure required server-side environment variables before deploying backend features.

## Install Python dependencies

To install the combined dependencies for both Python services from the repository root:

```sh
python3 -m pip install -r requirements.txt
```

For an individual service, install its own manifest instead: `ml-api/requirements.txt` or `functions/requirements.txt`.
