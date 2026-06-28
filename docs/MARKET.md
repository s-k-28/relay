# Market scan

Relay sits on a real and expensive problem, and it solves it from an angle no shipping product takes. This page is the grounded version of the pitch. Every competitor claim below is checked against the product's own documentation, linked at the end.

## The problem the market sits on

Knowledge work runs on interruptions. The "quick question" is the unit. It costs the asker a wait and the answerer a context switch, and the answer is often already written down somewhere the asker cannot find. Gloria Mark's research on interrupted work at UC Irvine is the standard reference for how costly that switch is: interrupted work gets done, but with more stress and effort, and refocusing after an interruption is slow. Every product below tries to reduce that cost. None of them remove the interruption itself by answering on a specific person's behalf before the human is touched.

## The status quo: Slack and Microsoft Teams

Slack is the channel-based hub where team knowledge lives in messages, threads, and files. Slack AI adds thread and channel summaries, Recaps, and Search Answers, a generated answer at the top of search with citations into the source messages, scoped to what the user can already see. Enterprise Search extends that across connected apps. After the August 2025 plan changes, Search Answers and Recaps sit in the Business+ tier and Enterprise Search in Enterprise+.

Microsoft Teams pairs the same collaboration surface with Microsoft 365 Copilot. Copilot answers questions about a meeting from its transcript and chat, catches up late joiners, and summarizes decisions and action items across chats and channels.

Both are corpus search with an AI layer on top. They route you to a shared archive, or to an org-wide assistant that reads that archive. Neither gives each person an agent that answers on their behalf and escalates to that specific human only when it cannot. The knowledge stays pooled, and the human is still the default for anything the search does not surface.

## The knowledge assistants: Glean, Dust, Notion AI

Glean is an enterprise work AI platform, an AI assistant and agents over a company's connected apps, built on a permission-aware knowledge graph. It raised a $150M Series F at a $7.2B valuation in June 2025 on reported ARR near $200M, so the category is real and well funded. Glean answers from a single shared index across all connected sources, respecting each user's permissions.

Dust positions itself as an operating system for AI agents, a platform to build and deploy custom agents on shared company connectors like Notion, Slack, and GitHub. The agents are scoped by the data sources and instructions a builder gives them.

Notion AI answers inside the Notion workspace, searching and summarizing across the workspace and connected sources through AI Connectors, and citing the specific sources it used.

All three are strong, and all three share one shape: knowledge is centralized into a shared corpus or a set of company-scoped agents, then queried. The unit is the knowledge base, or a tool built on it. None of them is a network of distinct people, each represented by their own agent, that routes a question to a specific person and hands off to that human on failure.

## The scheduling router: Calendly

Calendly removes scheduling back-and-forth by letting people self-book open slots, and Calendly Routing sends a lead to the right person's booking page based on form answers and CRM ownership. It routes you to a human's calendar slot. You still wait for the meeting. Relay routes the knowledge instead, and only consumes the human's time when the agent genuinely cannot answer.

## Why Relay is different, and why only Aicoo makes it possible

Every product above treats knowledge as a pool to search, or treats the human as the thing to schedule. Relay treats the person as the unit. Each member is a node, represented by their own permissioned agent, answering from the context that person chose to expose. A question is brokered to that specific person's agent, not to a shared index. The human is the fallback, reached only on escalation, with the full thread attached.

That model needs one thing the others do not have: a per-person, permissioned, callable agent for every member. That is exactly what Aicoo provides. Aicoo gives each user an agent that acts on their behalf with their own key and their own context. Relay is the routing layer on top. Without Aicoo there is no network of individually owned agents to route between, only another shared bot over a shared corpus, which the market already has.

Positioning line: the interruption layer for teams, replaced by agents.

## Sources

- Slack AI features. https://slack.com/help/articles/25076892548883-Guide-to-AI-features-in-Slack
- Slack plan and pricing changes, August 2025. https://slack.com/help/articles/39264531104275-Updates-to-feature-availability-and-pricing-for-Slack-plans
- Microsoft 365 Copilot in Teams. https://support.microsoft.com/en-us/teams/copilot/catch-up-on-meetings-with-microsoft-365-copilot-in-teams
- Glean Series F, $7.2B valuation. https://www.glean.com/press/glean-raises-150m-series-f-at-7-2b-valuation-to-accelerate-enterprise-ai-agent-innovation-globally and https://techcrunch.com/2025/06/10/enterprise-ai-startup-glean-lands-a-7-2b-valuation/
- Dust product. https://dust.tt/home/product
- Notion AI Connectors. https://www.notion.com/help/notion-ai-connectors
- Calendly Routing. https://calendly.com/blog/routing
- Gloria Mark, The Cost of Interrupted Work, CHI 2008. https://ics.uci.edu/~gmark/chi08-mark.pdf
