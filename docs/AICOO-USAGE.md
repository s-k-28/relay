# How we used Aicoo to build Relay

This is the evidence for the team collaboration criterion, which is 10 percent of the score. The criterion rewards teams that ran their own work on Aicoo, not just teams that called the API from a product. We did both. Relay is built on Aicoo, and the build itself was coordinated through Aicoo.

## We dogfooded the exact pattern we shipped

Relay's thesis is that an agent should answer from a person's context, and a human should be the fallback. We ran the Relay build the same way. Each of the four parallel build sessions has a lane, a context, and a clear escalation path to a human when a decision is genuinely ambiguous. The agents did the work. The human integrated and made the calls the agents could not.

## What we used

- Aicoo notes and todos as the shared build log. Each session writes what it built and any contract gaps into Aicoo, so the orchestrator reads one place instead of chasing four terminals.
- The Aicoo `POST /briefing` endpoint to generate an executive summary of build status from those notes and todos. This is the same AI COO surface a real team would use for a standup, and it is the surface Relay leans on for the escalation and write-back paths.
- The frozen contract in `PRD.md` as the single source of truth, so the frontend and backend sessions built against the same shapes in parallel without blocking each other.

## How the four lanes coordinated

```
Session 1  orchestrator   integrates branches, deploys, submits
Session 2  frontend       app/ UI and components
Session 3  backend        app/api/ and lib/, Aicoo integration
Session 4  research/docs   README and docs/, this submission
```

Each session committed small and often to its own branch. The orchestrator merged into `main`, which is the same broker-and-escalate shape Relay uses: the agents handle their lanes, and the human steps in at the integration points that need judgment.

## Evidence

Two screenshots are captured by the integrating session and inserted here before submission.

1. `[SCREENSHOT PENDING]` The Aicoo notes and todos we kept during the build, showing the per-lane log.
2. `[SCREENSHOT PENDING]` The output of the Aicoo `/briefing` endpoint summarizing build status from those notes.

Both screenshots show real Aicoo surfaces used during this build. They are added once captured, before the Devpost submission is finalized.

## Why this matters for the score

The team collaboration criterion is not asking whether we used Aicoo in the product. The 30 percent API criterion already covers that. This criterion asks whether the team used Aicoo to work. We did. The same notes, briefing, and escalation model that powers Relay also ran the Relay build, which is the most honest possible demonstration that the pattern works.
