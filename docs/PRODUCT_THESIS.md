# Udaan AI

## Release-candidate companion experience review

**Candid score: 7.5/10.** This is a product assessment, not an official judging score or a claim of owner research. It is grounded in actual executed mobile journeys, retained profile/outcome behavior and captured running-app screens.

Udaan is more connected than a dashboard with an unrelated chatbot: discovery, discussion, deterministic feasibility and saved learning share the same restaurant context. It does not yet behave like an always-available, fully natural proactive companion.

| Ravi's question | Score | Observed behavior |
|---|---:|---|
| Is Home immediately useful? | 8 | Restaurant greeting, breakfast imagery, one affordable ₹99 possibility, budget and an explicit business-specific reason lead the screen. |
| Does it know my business/history? | 8 | Menu, Whitefield location, weekday challenge, budget, recent conversations and saved outcomes enter the common conversation context. |
| Are suggestions contextual? | 7 | Business context and outcomes change selection/explanation, but discovery is a curated catalogue and Demo reasoning uses bounded intent rules. |
| Can a question become an action? | 8 | Conversation opportunity links reach editable feasibility and an owner-confirmed seven-day experiment. |
| Does it learn from results? | 8 | The same 70/130-unit pipeline persists different facts and recommends different next tests. This is rule-based learning, not model retraining. |
| Does it feel supportive/proactive? | 7 | A possibility-first Home, follow-up questions and linked next ideas help; fresh context-aware conversational openings are less prominent than explicit user requests. |
| Is it simple for a busy owner? | 7 | Four-language mobile navigation and visual costs help, but provider/configuration language and multiple financial/approval steps need presenter guidance. |
| Is value visible within 30 seconds? | 8 | The image-led combo, shop-specific explanation and limited budget communicate a small practical opportunity without requiring a dashboard analysis. |

### Three strengths
1. **One coherent decision-to-learning loop:** the next recommendation changes after an actual saved outcome, rather than being an unrelated chat answer.
2. **Concrete, bounded decisions:** a seven-day test, transparent assumptions, exact rupee arithmetic and explicit owner confirmations are more actionable than generic growth advice.
3. **Language and evidence separation:** four-language state continuity, attributed restaurant observations and explicit AI/Demo/fictional labels support understandable trust.

### Three critical gaps
1. **Curated/rule-based behavior remains noticeable.** The catalogue is finite, Demo understanding is bounded and the live six-call allowance is exhausted. An unfamiliar question can expose the limits faster than a genuine unrestricted companion would.
2. **Natural voice access is not complete.** Sarvam's generated-audio API loop works internally, but main-chat Sarvam, real microphone capture and pronunciation have not been validated. A busy owner cannot yet rely on a fully tested voice-first path.
3. **Continuity and simplicity require too much owner navigation.** Stored context is technically real, but the product could explain the latest remembered outcome and the single next action more plainly; provider terminology and financial detail add cognitive load.

### Small recommendations, not changes in this frozen candidate
- In a later approved copy-only pass, lead the existing conversation entry with one sentence about the last saved outcome and why the current next idea follows. Use existing stored facts, not a new background process.
- Put the existing business-specific reason before secondary financial detail, and explain contribution in everyday language while retaining the authoritative financial panel.
- For the current demo, preselect honestly labeled Demo Mode, prepare the two outcome tabs and keep provider configuration out of the three-minute path. Do not add features, spend calls or promote unverified voice during stabilization.

No redesign or new feature was implemented for this review. Physical iPhone/Safari use and actual restaurant-owner research remain unverified.

---

## Every small business deserves a big possibility.

**Promise:** An AI companion that understands your business, speaks your language, and grows with you.

### The human problem
Ravi is a fictional owner of a South Indian breakfast café in Whitefield, Bengaluru. He manages customers, preparation, staff and suppliers. Ambition is not missing; time to discover and evaluate new ideas is.

### RFS 76 alignment
Built in response to RFS 76, “An AI Companion for Small Business Owners,” at Product (Un)Conference 2026 Builders' Day. This origin does not imply endorsement, investment or partnership.

### Vision and initial customer
Independent Indian restaurant and café owners deserve context-aware inspiration in the language they naturally use. Udaan helps them explore what their business could become, not merely manage today's operations.

### Experience
Discover → Explore → Evaluate → Try → Measure → Learn → Discover again.
An image-led daily idea leads to a contextual conversation, explicit assumptions, a transparent financial evaluation, a seven-day owner-approved experiment, recorded outcomes and a linked next recommendation.

### Why now
Language models make natural multilingual exploration accessible; mobile tools make small experiments practical. This is a product hypothesis, not evidence of market adoption.

### Three signatures
- **It understands me:** retained shop, menu, challenge, budget, language and conversation.
- **It opens new possibilities:** affordable office subscriptions, opt-in pre-orders, loyalty, combinations and simple technology.
- **It grows with me:** outcome-sensitive learning changes what is recommended next.

### AI differentiation
The AI receives retained business context and actual stored experiment results. A shared provider contract supports Demo/OpenAI/Anthropic. Validated opportunity IDs connect conversation to action. Money and lifecycle mutations remain deterministic and owner-confirmed. Memory is persisted context, not fine-tuning.

### Evidence, not dashboard decoration
At 70 units, the ₹99 combo generates ₹2,280 modeled contribution and a ₹600 visibility hypothesis. At 130 units, ₹5,520 leads to repeat-customer testing or controlled expansion. The same pipeline produces both. These are synthetic demonstrations, not measured business impact.

### Architecture
React/Vite, Express, TypeScript, OpenAPI/Zod, Prisma/SQLite, shared official-provider SDK adapters, deterministic financial and learning services, four translation dictionaries, Vitest/Playwright. The framework variation from Next.js was explicitly approved.

### Commercial opportunity
Initial focus: independent restaurants and cafés. A freemium subscription with paid pricing of ₹299–499/month is **unvalidated**. No willingness-to-pay research, market-size claim, revenue, traction, customer count or endorsement is asserted.

### Retention hypothesis
Owners may return because Udaan retains their business context, regularly introduces relevant possibilities and builds on their recorded experiments. Repeated usage and real-world outcome validation are needed.

### Expansion hypothesis
After validating restaurant demand, adjacent possibilities include bakeries, retailers and salons. These are future possibilities, not implemented industry verticals.

### Roadmap
**Implemented:** isolated demo sessions, four-language discovery/chat, persisted profile, deterministic money, lifecycle, immutable results, linked learning, provider settings, OpenAI/Anthropic adapters, browser voice support.

**Verified:** live OpenAI contextual Hinglish and stored-outcome interpretation; expected/actual financial scenarios; credential-free mobile lifecycle; state-preserving language switching; isolated reset; unit tests and TypeScript.

**Unverified/planned:** Anthropic live call, native-speaker/voice review, production persistence, presenter auth for paid public access, real-owner research, authorized GitHub publication and optional Gnani.

### Current limitations
Read `KNOWN_LIMITATIONS.md`, `TEST_REPORT.md` and `IMPLEMENTATION_STATUS.md`. The objective is a reliable competition demonstration, not a claim of production readiness.

### Late-stage additions, honestly scoped
Market Inspiration now retrieves actual attributed Whitefield menu facts via the documented IndiaRestros REST API. It separates periodic source facts and dates from AI/Demo hypotheses, and connects to a no-spend pre-order experiment. API retrieval and the actual UI path passed browser testing; market-specific paid inference was not separately run.

Sarvam voice was requested near the feature freeze. Official Saaras v4/codemix and Bulbul v4 Flash documentation was checked; missing credentials and spending authorization prevent credible real-audio validation. It remains pending, with no voice-integration completion or pronunciation claim.
