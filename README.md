# UniBro (College admissions with AI)

## Quickstart

- Copy `.env.example` to `.env` and set `GOOGLE_GEMINI_API_KEY` (optional – the app will use a mock if absent).
- Install and run:

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Features

- **Application:** autosaved Common App profile and essay with AI feedback.
- **Colleges:** add schools, paste prompts, auto-generate fields, estimate realistic chances.
- **My Plan:** generate a dated action plan tailored to interests and location.
- **Chatbot:** context-aware helper on each page.

## Notes

- All inputs auto-save to `localStorage` for now. No server database is required.
- Gemini API is used via `/app/api/gemini/*`; if no API key is present, a safe mock responds.
- This is a minimal MVP scaffold meant for rapid iteration.
