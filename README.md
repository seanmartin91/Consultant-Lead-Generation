# Lead Gen Tool — Sean Martin IT Sales

An AI-powered lead generation tool that creates qualified prospect profiles and personalized outreach messages for IT sales consulting.

## What it does

- Filter leads by industry, company size, decision maker role, geography, and pain point
- Generates realistic prospect profiles with specific "pain signals"
- Writes a personalized LinkedIn connection request for each lead
- Writes a cold email (subject + body) for each lead
- Scores leads as Hot or Warm
- One-click copy for every message

## How to use it

1. Open `index.html` in any browser (no server needed — it's plain HTML/CSS/JS)
2. Fill in your target filters
3. Enter your [Anthropic API key](https://console.anthropic.com/) — it's used directly in-browser and never stored
4. Click **Generate leads**

## Tech stack

- Plain HTML, CSS, JavaScript — no frameworks, no build step
- [Anthropic Claude API](https://docs.anthropic.com/) (`claude-sonnet-4-20250514`)
- Works offline except for the API call

## Running locally

Just open the file:

```bash
open index.html
```

Or serve it with any static server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Deploying

Since this is a static site, you can host it for free on:

- [GitHub Pages](https://pages.github.com/) — enable in repo Settings → Pages → Deploy from branch `main`
- [Netlify](https://netlify.com) — drag and drop the folder
- [Vercel](https://vercel.com) — `vercel deploy`

## API key security

Your Anthropic API key is entered in the browser at runtime and is never logged, stored, or sent anywhere except directly to `api.anthropic.com`. For a production deployment shared with others, move the API call to a backend proxy so the key stays server-side.

## Customization

- **Edit the prompt** in `app.js` inside `generateLeads()` to change Sean's background, tone, or output fields
- **Add more filters** by adding a `<select>` in `index.html` and passing the value into the prompt string
- **Change the model** by updating the `model` field in the fetch call
