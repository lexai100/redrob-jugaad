# 🐦 Redrob Jugaad

> **Real Gigs. Real Students. Real Results.**

AI-powered micro-gig marketplace built for India's 40M+ college students and 63M+ small businesses. Submitted for the **India Runs Hackathon 2026**.

🔗 **Live:** [redrob-jugaad.vercel.app](https://redrob-jugaad.vercel.app)

---

## What It Does

Redrob Jugaad connects small businesses who need quick, affordable task work with college students who want to build a real portfolio — not just a CV.

The core idea: **two scores, not one.**

| Score | What it is | How it's set |
|---|---|---|
| 🌱 **Seed Score** | Raw aptitude — your starting point | One-time AI-proctored assessment |
| 📈 **Track-Record Score** | Proven delivery history | Updates after every gig milestone |

A student who aces a test but never delivers gets stuck. A student who consistently delivers climbs. Businesses see both numbers and decide who to hire.

---

## Key Features

### 🎓 For Students
- Pick a **skill track**: Dev, Design, Content, or Marketing
- Take a **35-min proctored assessment** (MCQ + written, graded by LLaMA 3.3 70B)
- Get a **Seed Score** — set once, never changes
- Get AI-matched to gigs that fit your skills and availability
- Build a **Track-Record Score** through real milestone delivery

### 🏢 For Businesses
- Post a task in plain English — AI generates a structured brief automatically
- See **ranked student shortlists** with verified scores, not just CVs
- Milestones are held in **escrow** — payment releases only after AI verification
- Build a repeat-hire talent pipeline

### 🔐 AI Proctoring (Assessment)
- **MediaPipe** tracks gaze direction, head pose, and face count in real time
- Distinguishes between looking down to type vs. looking at a phone
- **Gemini Flash** performs a full visual audit every ~35s during sustained suspicious posture
- Mandatory fullscreen lock — tab switch or blur = **−3 min penalty**
- Phone detected by Gemini = **−3 min penalty**

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Vanilla CSS with custom design tokens |
| AI Grading | Groq API — LLaMA 3.3 70B Versatile |
| Visual Audit | Google Gemini 1.5 Flash |
| Proctoring | MediaPipe FaceMesh (client-side, browser) |
| Deployment | Vercel |

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/student/onboarding` | Assessment flow (track → MCQ → written → result) |
| `/student/[id]` | Student profile with scores and gig history |
| `/student/[id]/gig` | Active gig / milestone submission |
| `/student/[id]/notifications` | Match alerts and milestone updates |
| `/business` | Post a task |
| `/business/shortlist` | AI-ranked student matches |
| `/leaderboard` | Live skill track leaderboard |
| `/how-it-works` | Plain English explainer |
| `/api/grade-answer` | LLaMA-powered written answer grading |
| `/api/generate-brief` | AI task brief generator |
| `/api/proctor-snapshot` | Gemini visual integrity audit |
| `/api/verify-milestone` | Milestone verification before payment |

---

## Assessment Design

```
Track Selection → MCQ (20 min) → Written Response (15 min) → Seed Score
```

- **MCQ**: 5 track-specific questions testing real technical depth
- **Written**: 1 open-ended question graded by LLaMA on a rubric — not just keyword matching
- **Timer penalties**: Violations subtract time in real time
- **Proctoring**: Webcam-on, fullscreen-locked, gaze-tracked

---

## Running Locally

```bash
git clone https://github.com/lexai100/redrob-jugaad.git
cd redrob-jugaad
npm install
```

Create a `.env.local`:
```env
GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Accounts

Use the **"Switch Role"** button in the navbar to explore as any persona:

| Role | Name | Track |
|---|---|---|
| Business | Rahul Sharma | — |
| Student | Arjun Mehta | Dev |
| Student | Sanya Kapoor | Design |
| Student | Rohan Verma | Dev |
| Student | Divya Nair | Content |

---

## Hackathon Context

Built for **India Runs 2026** — a hackathon focused on solving real problems for India's informal economy. The gig economy in India is massive but trust is broken: businesses can't verify student skills, and students have no proof of real delivery history. Redrob Jugaad fixes both sides with AI.

---

*Built by the Redrob Jugaad team · Powered by Groq + Gemini + MediaPipe*
