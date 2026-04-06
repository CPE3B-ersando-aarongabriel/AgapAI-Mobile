# AgapAI Mobile Frontend Scaffold

Initial production-style React Native scaffold for AgapAI, a device-first sleep coach. This repository is intentionally configured with **structure and UI placeholders only** (no business logic, no live API calls, no auth flow).

## Stack

- Expo + React Native + TypeScript
- React Navigation (stack + bottom tabs)
- NativeWind (Tailwind-style utilities for React Native)
- Axios (prepared API client scaffold)

## Product Context Alignment

AgapAI mobile is a read-only extension of the ESP32 hardware system and backend pipeline.

- Sensor ecosystem: HLK-LD2410 (or alternative breathing sensor), INMP441, DHT22
- Backend role: ingest session sensor data, persist in MongoDB, return recommendations and advanced analysis
- Mobile role: view sessions, analytics, recommendations, advanced tailored analysis, and insight chat UI

## Implemented Scaffold Flow

1. Home Dashboard
2. Session History
3. Session Details
4. Advanced Analysis Input
5. Advanced Analysis Loading
6. Insight Chat

All screens currently contain static placeholder content only.

## Folder Architecture

```text
src/
   assets/
      icons/
      logos/
      ui/
   components/
      charts/
      common/
      insight/
      loading/
      session/
   hooks/
   navigation/
   screens/
   services/
      api/
   store/
   theme/
   types/
   utils/
```

## Environment Setup

Create and edit local environment values:

```bash
cp .env.example .env
```

Example variables:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_APP_MODE`
- `EXPO_PUBLIC_CHAT_ENDPOINT`
- `EXPO_PUBLIC_ADVANCED_ANALYSIS_ENDPOINT`

## Start Development

1. Install dependencies

```bash
npm install
```

2. Run the app

```bash
npm run start
```

3. Validate typing/lint

```bash
npm run typecheck
npm run lint
```

## Notes

- No authentication or authorization is implemented.
- No device control flow is included.
- Data hooks/store/services are placeholders for future implementation.
