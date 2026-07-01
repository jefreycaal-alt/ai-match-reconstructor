# AI Match Reconstructor
### IBM AI Builders Challenge — June 2026

## The Problem
Millions of football fans miss matches due to work, school, or time zones.
Current options give you facts but not the emotional experience of watching
the match unfold moment by moment.

## The Solution
An agentic AI system that reconstructs the experience of watching a football
match in 2-3 minutes. Users click to kick off, then swipe through a
TikTok-style timeline of key moments — each with an IBM Granite-generated
narrative and highlight clip.

## How It Works
1. A preloaded match dataset (Argentina vs France, 2022 World Cup Final)
   is sent to IBM Granite via watsonx.ai
2. Granite generates a match summary, dual fan-perspective reactions, and
   emotionally engaging narratives for each key moment
3. Results are displayed in a swipeable React frontend with a ball-kick
   animation on the landing screen

## IBM Technologies Used
- **IBM Granite (granite-3-8b-instruct)** via watsonx.ai — match summary,
  fan reactions, and per-event narrative generation
- **Langflow** — visual AI agent orchestration layer
- **IBM Context Forge** — planned production MCP tool registry architecture
- **IBM Bob** — used as AI coding assistant during development

## Notes
Live sports APIs (football-data.org) were replaced with preloaded match
data for a reliable demo. Granite narrative generation is live and real.
Context Forge is described as the production architecture plan and was not
implemented in this 24-hour build.

## Setup
1. Clone this repo
2. Copy `backend/.env.example` to `backend/.env` and fill in your API keys
3. `cd backend && py -m pip install fastapi uvicorn requests python-dotenv`
4. `py -m uvicorn main:app --reload`
5. `cd frontend && npm install && npm run dev`
6. Open http://localhost:5173

## Team
- Jefrey Caal — CSULA, ECE Student
