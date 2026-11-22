# UDAAN AI
## MASTER PRODUCT, DESIGN, ENGINEERING AND EXECUTION SPECIFICATION
### VERSION 5.0 — TOP 6 COMPETITION EDITION

Product: Udaan AI

Tagline: Your business. New possibilities. Every day.

Event: Product (Un)Conference 2026 — Builders' Day

Challenge: RFS 76 — An AI Companion for Small Business Owners

Challenge author: Pratik Poddar, Partner, Nexus Venture Partners

Build environment: Replit Agent

Build duration: Four hours, subject to the actual remaining submission time.

Competition objective: Qualify among the top six products for the stage demonstration at 6 PM.

Proposed GitHub repository: amit1858/udaan-ai

---

# 1. MASTER OPERATING INSTRUCTIONS

Act as an autonomous multidisciplinary startup product team comprising expertise in:

- Product strategy.
- Customer experience.
- Mobile-first product design.
- Visual storytelling.
- Full-stack engineering.
- Conversational AI.
- OpenAI and Anthropic integration.
- Multilingual applications.
- Voice interfaces.
- Financial modeling.
- Automated testing.
- Startup demonstrations.

Build a genuinely working, visually compelling AI product.

This document replaces all previous Udaan specifications and amendments.

Treat it as the single source of truth.

Read the entire document before making implementation decisions.

Create a short implementation plan and begin immediately.

Do not stop after planning.

Build incrementally.

For each milestone:

1. Implement.
2. Validate.
3. Test.
4. Fix blocking defects.
5. Save a working checkpoint.
6. Update implementation status.
7. Continue automatically.

Do not request routine intermediate approvals.

Do not silently deviate from the master specification.

If a mandatory requirement cannot be implemented, document the verified blocker, proposed alternative and impact.

Request approval only for material changes to product functionality, architecture, security, cost, public deployment or publication.

Do not introduce unrelated features.

Do not sacrifice the working product for visual polish.

Equally, do not treat visual design as an optional afterthought.

Comply with hackathon rules.

---

# 2. OFFICIAL JUDGING CRITERIA

The organizers have announced five criteria:

1. IT WORKS
2. PROBLEM & USER
3. PRODUCT SENSE
4. USE OF AI
5. DEMO

The top six submissions will demonstrate on stage at 6 PM.

No official criterion weights have been provided.

Optimize the build against all five criteria.

## Criterion 1 — It works

Demonstrate:

- Working mobile application.
- Reliable navigation.
- Actual persisted business records.
- Complete experiment lifecycle.
- Correct calculations.
- Outcome-sensitive recommendations.
- Reliable language switching.
- No broken primary interactions.
- Functional demo fallback.

## Criterion 2 — Problem & User

Demonstrate:

- Clear alignment with RFS 76.
- A relatable restaurant owner.
- Understanding of Indian small-business constraints.
- Accessible language.
- Inspiration that fits the owner's actual context.
- Affordable and practical experiments.

## Criterion 3 — Product Sense

Demonstrate:

- A focused customer journey.
- Mobile-first interaction.
- Premium consumer-grade visual experience.
- Natural conversational communication.
- Progressive disclosure.
- Thoughtful prioritization.
- Persistent business learning.
- Clear differentiation from generic chat advice.

## Criterion 4 — Use of AI

Demonstrate:

- At least one verified live LLM provider.
- Contextual business reasoning.
- Natural Hinglish conversation.
- Follow-up questions.
- AI-generated contextual exploration.
- AI interpretation of previous experiment outcomes.
- Safe integration with deterministic financial calculations.
- Grounded, validated recommendations.

AI must be central to the customer experience, not a decorative chatbot added to a dashboard.

## Criterion 5 — Demo

Demonstrate:

- Human-led storytelling.
- Visually engaging discovery.
- A genuine AI interaction.
- A complete working journey.
- A surprising business possibility.
- Multilingual accessibility.
- An outcome-sensitive learning moment.
- A compelling closing message.

Create docs/JUDGING_ALIGNMENT.md containing implementation evidence for all five criteria.

---

# 3. ORIGINAL PROBLEM

RFS 76 asks for an AI companion that helps small-business owners:

- Look beyond their daily operational demands.
- Find fresh inspiration.
- Discover how similar businesses have reinvented themselves.
- Understand emerging technology.
- Explore unfamiliar business ideas.
- Learn in their own language.
- Imagine what their business could become.

Udaan must solve this problem.

Do not build a generic restaurant chatbot, analytics dashboard, calculator or restaurant management system.

The primary product experience is discovering new possibilities.

Financial evaluation, experiments and learning support that experience.

---

# 4. THE HUMAN STORY

Meet Ravi.

Ravi is a fictional owner of a small South Indian breakfast restaurant in Whitefield, Bengaluru.

His day starts early.

He manages food preparation, customers, staff, suppliers, expenses and orders.

He is ambitious.

He wants to improve his business but rarely has time to explore new possibilities.

He sees larger restaurants adopting digital technology, loyalty programs, subscriptions and innovative business models.

He does not know which ideas are relevant or affordable for his restaurant.

Udaan becomes his business companion.

It introduces one relevant possibility.

It explains the idea in his natural language.

It helps him understand what trying the idea would cost.

It helps him take a small step.

It remembers what happened.

It helps him decide what to explore next.

The product must tell this story through actual interactions.

---

# 5. PRODUCT THESIS

Product name:

Udaan AI

Tagline:

Your business. New possibilities. Every day.

Primary product promise:

An AI companion that understands your business, speaks your language, and grows with you.

Investor-facing headline:

Every small business deserves a big possibility.

Primary customer:

Independent restaurant and café owners in India.

Core product loop:

Discover → Explore → Evaluate → Try → Measure → Learn → Discover again.

Three signature capabilities:

## It understands me

Udaan understands my restaurant, challenges, preferences, budget and language.

## It opens new possibilities

Udaan introduces relevant ideas I may not have considered.

## It grows with me

Udaan learns from my recorded outcomes and uses that history to improve future recommendations.

The three capabilities must be visible and demonstrable.

---

# 6. PRODUCT SCOPE

Build four primary mobile destinations:

- Home.
- Discover.
- Ask Udaan.
- My Plans.

Secondary destinations:

- My Shop.
- Language settings.
- AI provider settings.
- Demo controls.

Mandatory workflows:

1. Select language.
2. Discover business inspiration.
3. Ask a contextual question.
4. Receive a visual recommendation.
5. Understand the idea.
6. Evaluate costs and potential contribution.
7. Approve and start an experiment.
8. Record outcomes.
9. Review learning.
10. Receive a context-sensitive next recommendation.

Do not expand into enterprise restaurant operations.

---

# 7. TECHNOLOGY STACK

Use a compatible implementation of:

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Lucide icons.
- Recharts.
- Prisma ORM.
- SQLite.
- Zod.
- Vitest.
- Playwright.

Use official OpenAI and Anthropic SDKs.

Use server-side API routes or server actions.

Use simple modular services.

Avoid unnecessary orchestration frameworks and microservices.

SQLite is the preferred persistent database.

If a verified Replit runtime limitation prevents reliable persistence, document the blocker and adopt the simplest supported persistent alternative.

Do not change technology merely for convenience.

The application must launch without external AI credentials.

The live AI experience must be enabled independently when authorized credentials are available.

---

# 8. REPLIT ENVIRONMENT

Configure:

- Supported host and port.
- Reproducible startup command.
- Database initialization.
- Idempotent synthetic demo seeding.
- Development preview.
- Secure environment configuration.

Use Replit Secrets.

Never embed API keys in code.

Never request credentials in chat.

Do not deploy publicly without explicit authorization.

Keep the application recoverable through Git commits or Replit checkpoints.

Verify persistence and preview behavior.

Avoid exposing business records through shared demo sessions.

---

# 9. VISUAL DESIGN — MANDATORY COMPETITION REQUIREMENT

The application must look like a premium consumer AI product.

It must not look like a generic administrative dashboard or unstyled chatbot.

Visual reference:

https://amit-pandey-ai-hub.netlify.app/

Inspect the rendered reference if accessible.

Use its premium dark AI aesthetic without copying personal content or proprietary assets.

## Visual tokens

Background: #05070D

Elevated surface: #0A0D16

Primary text: #E8EDF5

Secondary text: #8C93A6

Electric cyan: #5CC6FF

Signal lime: #BDF52F

Border: #202638

Use a restrained premium dark visual language.

Cyan represents intelligence.

Lime represents opportunity and progress.

Avoid dominant pink, rose or pastel-green styling.

Use:

- Strong editorial typography.
- Large, attractive opportunity cards.
- Meaningful photography.
- Premium visual hierarchy.
- Soft gradients.
- Subtle glows.
- Elegant borders.
- Consistent iconography.
- Clear primary actions.
- Spacious layouts.
- Minimal, purposeful animations.

Do not use excessive gradients, decorative neon or animation that distracts from content.

---

# 10. VISUAL ASSET STRATEGY

Visual elements are mandatory.

Create a reusable visual asset collection.

Required subject matter:

1. South Indian restaurant owner.
2. Restaurant interiors.
3. Idli, dosa, vada and filter coffee.
4. ₹99 breakfast-combo presentation.
5. Office breakfast subscription boxes.
6. Takeaway food packaging.
7. WhatsApp ordering or pre-order concept.
8. QR ordering and digital payment concept.
9. Customer loyalty cards.
10. Small-business growth and progress illustrations.

Use original, appropriately licensed or otherwise permitted imagery.

Store permitted images locally.

Optimize images for mobile loading.

Create meaningful alt text.

Avoid unreliable external hotlinks.

Do not depend on a paid image-generation API.

If appropriately licensed photography is unavailable, create original illustrations using SVG or locally generated graphics.

Do not fabricate screenshots, real business photographs or competitor evidence.

## Required visual experiences

Home:

A large featured daily idea with relevant imagery.

Discover:

Editorial-style image-led opportunity cards.

Ask Udaan:

Rich conversational responses with opportunity cards, simple financial breakdowns and direct actions.

Experiment setup:

Visual cost breakdown, progress indicator and simple outcome forecast.

My Plans:

Visual lifecycle timeline and experiment cards.

Learning:

Before-versus-after visual comparison, target achievement and linked next recommendation.

Voice:

Visual listening, processing and speaking indicators where voice is available.

Language selection:

Four attractive language choices, not a plain settings form.

## Visual performance

Use locally stored optimized assets.

No empty placeholder images in primary demonstration screens.

No decorative charts with fabricated data.

No unnecessary heavy video backgrounds.

---

# 11. MOBILE UX REQUIREMENTS

Primary viewport:

390 × 844.

Secondary viewport:

360 × 800.

Requirements:

- No horizontal overflow.
- Primary action visible above the fold.
- Minimum 44 × 44 px primary touch targets.
- Sticky bottom navigation where appropriate.
- Mobile safe-area support.
- Keyboard-safe conversation composer.
- Readable typography.
- Accessible contrast.
- Smooth loading states.
- Clear feedback after actions.
- Reduced-motion support.
- Responsive desktop experience.

Use dark mode only.

Design for a busy restaurant owner using one hand.

Keep the main journey simple.

Do not require lengthy onboarding.

---

# 12. FOUR-LANGUAGE EXPERIENCE

Support four independent preferences:

- English.
- Hinglish.
- हिन्दी.
- ಕನ್ನಡ.

Do not remove Hindi.

Do not treat Hinglish as a replacement for Hindi.

## English

Internal ID: en.

Locale: en-IN.

Simple conversational Indian English.

## Hinglish

Internal ID: hinglish.

Suggested language tag: hi-Latn-IN.

Roman-script Hindi-English code-switching.

Default speech locale: hi-IN or verified multilingual configuration.

## Hindi

Internal ID: hi.

Locale: hi-IN.

Natural conversational Devanagari Hindi.

## Kannada

Internal ID: kn.

Locale: kn-IN.

Natural conversational Kannada.

Use familiar English business terms where appropriate.

Separate display-language and speech-provider configuration.

Do not assume all speech systems support arbitrary language tags.

## First-launch language selection

Show four visually engaging options:

English

Hinglish — Aapki apni language

हिन्दी — अपनी भाषा में

ಕನ್ನಡ — ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ

Persist language preference.

Enter the business experience immediately.

## Language selector

Provide a visible header dropdown and settings selector.

Changing language must not reset:

- Business context.
- Conversation history.
- Financial inputs.
- Experiment records.
- Learning history.
- AI provider selection.

## Localization architecture

Maintain shared dictionary files:

locales/en.json

locales/hinglish.json

locales/hi.json

locales/kn.json

Use stable translation keys and intent IDs.

Localize all primary navigation, greetings, opportunities, questions, answers, forms, calculations, results, learning summaries and errors.

Use appropriate Unicode fonts, including Devanagari and Kannada support.

Avoid separate business logic for each language.

---

# 13. NATURAL INDIAN CONVERSATIONAL LANGUAGE

The product should speak the way an owner naturally speaks.

Preserve familiar business words:

Restaurant, customers, sales, menu, combo, offer, budget, promotion, feedback, business, WhatsApp, UPI and delivery.

Avoid formal literary translations.

English example:

"Weekday customers are down. Let's try a ₹99 breakfast combo."

Hinglish example:

"Ravi, weekdays par customers kam aa rahe hain. Chalo ₹99 ka breakfast combo try karte hain."

Hindi example:

"रवि, weekdays पर customers कम आ रहे हैं। चलिए ₹99 का breakfast combo try करते हैं।"

Kannada example:

"ರವಿ, weekdays ನಲ್ಲಿ customers ಕಡಿಮೆ ಬರುತ್ತಿದ್ದಾರೆ. ₹99 breakfast combo try ಮಾಡೋಣ."

Financial explanation in Hinglish:

"Banane aur promotion ke kharche ke baad ₹3,900 bach sakte hain."

Keep language friendly, respectful and understandable.

Accept Roman-script Hinglish, Devanagari Hindi, Kannada, English and mixed-language input.

Respond using the selected output preference.

The deterministic demo must support representative questions in all four styles.

The live LLM may handle broader natural language questions.

Do not claim unrestricted multilingual understanding for fixed intent matching.

---

# 14. BUSINESS PROFILE AND PERSISTENT CONTEXT

Seed:

Udaan Breakfast House.

Whitefield, Bengaluru.

Fictional independent South Indian breakfast café.

Business context must include:

- Shop name.
- Business category.
- Location.
- Opening hours.
- Menu.
- Selling prices.
- Making costs.
- Average orders.
- Recent sales.
- Primary business challenge.
- Experiment budget.
- Preferred language.

Generate 90 days of clearly labeled synthetic sales data.

Include realistic weekday and weekend patterns.

Use a consistent example weekly baseline:

Revenue: ₹87,600.

Orders: 1,095.

Average order value: ₹80.

Variable costs: ₹38,325.

Contribution before overhead and promotion: ₹49,275.

Use this baseline consistently.

Provide simple profile editing.

Persist business details and historical outcomes.

Distinguish:

- Owner-confirmed information.
- Synthetic demo data.
- AI suggestions.
- Unverified assumptions.
- Recorded experiment outcomes.

Business memory means retained contextual information, not model fine-tuning.

---

# 15. HOME EXPERIENCE

Home answers:

"What new possibility can I explore for my business today?"

Header:

- Udaan identity.
- Greeting.
- Shop name.
- Language selector.

Featured visual card:

One idea for your shop today.

Example:

₹99 Weekday Breakfast Combo.

Include:

- Authentic-looking food imagery.
- Short explanation.
- Why the idea fits.
- Estimated test budget.
- Potential benefit.
- Listen action.
- Explore CTA.

Secondary content:

- Learn from another business.
- Discover new technology.
- Try something different.
- Compact business pulse.
- Recent learning.

The featured opportunity must dominate the screen.

Do not overwhelm the owner with KPIs.

---

# 16. DISCOVERY ENGINE

Discovery is the heart of the product.

Build at least six visually rich cards, including three actionable experiments.

## Learn from other businesses

Example stories:

- Café introducing office breakfast subscriptions.
- Restaurant launching weekday meal combinations.
- Bakery accepting pre-orders to reduce waste.

Explain:

What did they try?

Why might it matter?

How could Ravi adapt it?

What assumptions need validation?

Clearly label illustrative or fictional stories.

Do not present fictional stories as actual case studies.

## Discover emerging technologies

Examples:

- WhatsApp pre-orders.
- QR menus.
- Digital loyalty cards.
- Simple demand forecasting.
- AI-assisted menu descriptions.

Explain technologies in plain language.

Include a practical first step.

Do not claim actual integrations are implemented unless verified.

## Try something different

Actionable opportunities:

- ₹99 weekday breakfast combo.
- Office breakfast subscription.
- Coffee loyalty program.

Every opportunity card must contain:

- Image.
- Attractive title.
- Short explanation.
- Why it fits the business.
- Estimated cost.
- Potential benefit.
- Important assumptions.
- Explore action.
- Listen action where supported.

Use saved business context.

Do not fabricate live competitor research.

Verified external examples may be used only with accurate sourcing.

---

# 17. ASK UDAAN — AI COMPANION

Build a genuine conversational application.

Include:

- Conversation history.
- Suggested questions.
- Text composer.
- Send button.
- Loading state.
- Follow-up interaction.
- Rich recommendation cards.
- Read-aloud.
- Optional microphone.
- Transparent provider status.

Primary Hinglish demonstration question:

"Mere restaurant mein weekdays par customers kam aa rahe hain. Main kya kar sakta hoon?"

Udaan must:

1. Understand the problem.
2. Retrieve restaurant context.
3. Introduce a relevant possibility.
4. Explain why it fits.
5. Ask for clarification when needed.
6. Explain potential costs and benefits.
7. Suggest an affordable experiment.
8. Provide a direct next action.

The response should contain a useful visual recommendation rather than only a long paragraph.

Do not reduce conversation to a fixed form.

---

# 18. LIVE AI — P0 REQUIREMENT

Live AI is a mandatory competition priority.

Implement the shared AI provider architecture early.

Support:

- Demo Engine.
- OpenAI.
- Anthropic.

Verify at least one live provider as early as credentials and authorization permit.

Do not postpone the first live connection check until the final build phase.

If live credentials are unavailable, immediately report the blocker while continuing to build the independent Demo Mode.

Minimum live AI acceptance:

- Genuine contextual question.
- Relevant business-specific response.
- Natural Hinglish output.
- Follow-up question.
- Context retrieved from persistent business data.
- Structured recommendation that can become an experiment.
- Interpretation of an actual stored experiment result.

The product must demonstrate AI doing meaningful work beyond generating generic restaurant advice.

If live verification remains blocked, label the application honestly and preserve the functional deterministic demo.

---

# 19. PROVIDER-NEUTRAL ARCHITECTURE

Create a common provider contract containing:

- Provider availability.
- Model configuration.
- Conversation generation.
- Structured recommendation generation.
- Context preparation.
- Error normalization.
- Timeout handling.
- Usage metadata.

All providers share:

- Business context.
- Conversation history.
- Localization.
- Financial calculations.
- Experiment services.
- Learning services.
- Validation.

Provider switching must not reset records.

Do not introduce separate business logic for OpenAI and Anthropic.

---

# 20. OPENAI INTEGRATION

Use the official OpenAI SDK.

Server-side variables:

OPENAI_API_KEY

OPENAI_MODEL

Use a supported model available to the configured account.

Implement:

- Connection status.
- Configuration validation.
- Contextual conversation.
- Structured recommendations.
- Error handling.
- Timeout handling.
- Rate-limit handling.

System instructions must include:

- Business profile.
- Selected language.
- Natural code-switching.
- Relevant discovery opportunities.
- Existing experiments.
- Learning history.
- Verified calculation results.
- Plain-language explanation requirements.

Verify an authorized real API call.

---

# 21. ANTHROPIC INTEGRATION

Use the official Anthropic SDK.

Server-side variables:

ANTHROPIC_API_KEY

ANTHROPIC_MODEL

Use a supported Claude model available to the configured account.

Use the same contextual and structured-response contract as OpenAI.

Support:

- Business grounding.
- Follow-up questions.
- Four output preferences.
- Natural Hinglish.
- Interpretation of financial results.
- Historical experiment interpretation.
- Validated structured output.

Implement both provider adapters.

Prioritize verification of one working provider before troubleshooting the second.

Verify the second if time and credentials permit.

---

# 22. AI PROVIDER SETTINGS

Provide a simple settings interface:

- Demo Mode.
- Live OpenAI.
- Live Anthropic.

Display:

- Provider name.
- Configured or not configured.
- Selected model.
- Connection status.
- Last test result.
- Test connection action.

Never display API key values.

When a live provider fails:

- Show a clear error.
- Allow retry.
- Allow switching providers.
- Allow explicit return to Demo Mode.

Do not silently present deterministic output as live AI.

Do not automatically send paid requests to both providers.

---

# 23. AI REASONING AND TRUST

AI may:

- Explore unfamiliar opportunities.
- Explain technologies.
- Personalize business ideas.
- Ask clarifying questions.
- Compare potential actions.
- Interpret verified results.
- Suggest future experiments.
- Explain uncertainty.

AI must not independently:

- Authoritatively calculate financial outcomes.
- Approve experiments.
- Change verified business records.
- Change experiment states.
- Execute payments.
- Execute real advertising.
- Fabricate market observations.

Use validated structured responses.

Use deterministic services for authoritative financial calculations and mutations.

Require explicit user confirmation.

Distinguish facts, hypotheses and assumptions.

Do not claim actual business improvement from hypothetical demo results.

---

# 24. CREDENTIAL-FREE DEMO ENGINE

The product must work without external AI providers.

Implement representative multilingual intent support for:

1. Improve weekday customers.
2. Explain the breakfast combo.
3. Calculate possible earnings.
4. Learn from similar businesses.
5. Discover useful technology.
6. Review experiment outcomes and next actions.

Support wording variations.

Use the same business state and intent IDs.

Provide suggested questions.

Unsupported questions should receive a clear limitation and supported alternatives.

Label Demo Mode.

Do not represent deterministic responses as live LLM output.

---

# 25. VOICE EXPERIENCE — P1

Implement progressively.

## Level 1 — Read aloud

Provide speaker controls on:

- Featured ideas.
- Discovery cards.
- Chat responses.
- Financial explanations.
- Learning summaries.
- Next recommendations.

Use browser speech synthesis where supported.

Provide:

- Play.
- Stop.
- Replay.
- Speaking indicator.

## Hinglish voice

Displayed Roman Hinglish may require a separate speech-friendly representation.

Display:

"Ravi, weekdays par customers kam aa rahe hain."

Speech-ready text:

"रवि, weekdays पर customers कम आ रहे हैं।"

Use Hindi or verified multilingual voice configuration.

Preserve natural English business terms.

Verify pronunciation.

Do not claim multilingual voice support without actual testing.

## Level 2 — Voice input

Where supported, implement push-to-talk.

Include:

- Listening animation.
- Editable transcript.
- Send.
- Retry.
- Cancel.
- Text fallback.

Do not automatically submit incorrect transcripts.

## Level 3 — Gnani

If time permits, integrate using verified Gnani documentation.

Architecture:

Microphone → Gnani STT → OpenAI or Anthropic → Gnani TTS → Spoken response.

Do not invent endpoints or supported languages.

Use Replit Secrets.

Measure actual latency.

Preserve browser and text fallbacks.

---

# 26. FINANCIAL ENGINE

Implement deterministic exact-money calculations using integer paise or equivalent.

Per-unit contribution:

Selling price minus making cost.

Expected revenue:

Selling price multiplied by expected units.

Expected variable costs:

Making cost multiplied by expected units.

Expected contribution after promotion:

Expected revenue minus variable costs minus promotion budget.

Actual revenue:

Selling price multiplied by actual units.

Actual contribution after promotion:

Actual revenue minus variable costs minus actual promotion spend.

Promotion break-even units:

Ceiling of promotion cost divided by positive per-unit contribution.

If per-unit contribution is zero or negative, explain that promotion cannot break even under those assumptions.

Do not call contribution net profit.

Fixed expenses such as rent, salaries and taxes are excluded unless explicitly modeled.

Validate inputs.

All displayed values must reconcile.

Use visual financial breakdowns.

Show:

Expected sales.

Making costs.

Promotion cost.

Money left after modeled costs.

Do not use misleading financial labels.

---

# 27. EXPERIMENT WORKFLOW

Create an intuitive journey:

Try this idea.

Steps:

1. Select opportunity.
2. Confirm selling price.
3. Confirm making cost.
4. Set promotion budget.
5. Set expected sales.
6. Choose seven-day duration.
7. Review and approve.
8. Start experiment.

Lifecycle:

Draft → Approved → Running → Completed.

Support cancellation where appropriate.

Validate transitions server-side.

Persist every transition.

Show a visual progress timeline.

Use clear primary actions.

No actual advertising, payments or purchases are executed.

---

# 28. RECORD RESULTS

Allow the owner to enter:

- Actual units sold.
- Actual promotion spend.
- Customer feedback.
- Optional observations.

In Demo Mode include:

Load Sample Results.

Require owner confirmation.

Calculate actual results from stored inputs.

Do not hardcode outcome cards.

Preserve completed experiment records.

Use separate experiments, isolated replay scenarios or demo reset to demonstrate alternative outcomes.

---

# 29. LEARNING ENGINE — CORE DIFFERENTIATOR

Persist experiment outcomes and generate contextual learning.

Show three visual sections:

What happened?

What did we learn?

What should we try next?

Compare:

- Expected versus actual units.
- Expected versus actual revenue.
- Expected versus actual contribution.
- Promotion spend.
- Target variance.

Generate a linked next recommendation.

Use actual stored outcomes.

The next recommendation must change when results change.

Do not infer causality without sufficient evidence.

Handle:

- Below-target experiments.
- Above-target experiments.
- Loss-making experiments.
- Insufficient data.

Implement deterministic learning rules.

Allow live AI to retrieve those results and create more contextual explanations and follow-up questions.

The AI should refer to actual previous experiment records during subsequent conversations.

Persist the link between an experiment, its learning and next recommendation.

---

# 30. EXACT FINANCIAL DEMONSTRATION

Recommended experiment:

₹99 Weekday Breakfast Combo.

Selling price: ₹99.

Making cost: ₹45.

Promotion budget: ₹1,500.

Target sales: 100 units.

Duration: Seven days.

## Expected outcome

Revenue: ₹9,900.

Variable costs: ₹4,500.

Contribution before promotion: ₹5,400.

Contribution after promotion: ₹3,900.

Promotion break-even: 28 units.

## Scenario A — Below target

Actual units: 70.

Actual promotion spend: ₹1,500.

Actual revenue: ₹6,930.

Variable costs: ₹3,150.

Contribution before promotion: ₹3,780.

Contribution after promotion: ₹2,280.

Target achievement: 70%.

Learning:

The offer generated positive modeled contribution but did not achieve the sales target.

A smaller visibility experiment may help test whether additional awareness improves demand.

Do not claim poor visibility is a proven cause.

Next recommendation:

Try a ₹600 local visibility experiment.

## Scenario B — Above target

Actual units: 130.

Actual promotion spend: ₹1,500.

Revenue: ₹12,870.

Variable costs: ₹5,850.

Contribution before promotion: ₹7,020.

Contribution after promotion: ₹5,520.

Target achievement: 130%.

Learning:

The offer exceeded its sales target.

A controlled repeat-customer offer or expansion could test whether demand continues.

Next recommendation:

Try a repeat-customer offer or controlled expansion.

Both scenarios must use the same calculation and learning pipeline.

Do not create disconnected hardcoded screens.

---

# 31. VISUAL ANALYTICS

Limit analytics to two meaningful charts:

1. Sales over time.
2. Expected versus actual experiment performance.

Use Recharts.

Localize labels.

Use accessible colors.

Keep charts understandable.

Additional visual components may include:

- Target-achievement progress bar.
- Cost breakdown.
- Experiment journey timeline.
- Learning summary card.
- Outcome comparison.

Do not build a separate enterprise analytics dashboard.

---

# 32. DEMO MODE AND RELIABILITY

Provide:

- Start Demo.
- Reset Demo.
- Load Sample Results.
- Provider settings.

Seed 90 days of fictional restaurant data.

Provide an idempotent npm run seed command.

Keep the credential-free journey operational.

Reset only the intended demonstration records.

Do not delete another visitor's data.

For a shared hosted instance, isolate demo sessions or restrict it to the presenter.

The application must remain usable if external AI fails.

Clearly distinguish synthetic data and live inference.

---

# 33. THREE SIGNATURE WOW MOMENTS

## Moment A — It understands me

Select Hinglish.

Use a genuinely live OpenAI or Anthropic conversation.

Ask:

"Mere restaurant mein weekdays par customers kam aa rahe hain. Kya karun?"

Show contextual guidance in natural Hinglish.

Show the relevant visual opportunity.

## Moment B — I had not thought of that

Explore office breakfast subscriptions.

Show a visual story.

Explain how WhatsApp pre-orders could support the concept.

Connect the unfamiliar idea to Ravi's budget and restaurant category.

Make this feel like inspiration rather than a generic recommendation list.

## Moment C — It grows with me

Run the breakfast-combo experiment.

Record the 70-unit outcome.

Show the ₹600 visibility follow-up.

Use a separate scenario with 130 units.

Show a different next recommendation.

Ask live AI what should be done next, using the persisted outcome.

Switch to Kannada or Hindi.

Show that the underlying business context is unchanged.

---

# 34. FOUR-HOUR EXECUTION PLAN

Use actual remaining time until submission.

Protect the final 25 minutes for rehearsal and submission.

If the time available is shorter than four hours, compress optional work first.

## Milestone 1 — Foundation and early AI verification

Minutes 0–25.

Implement:

- Replit project.
- Startup configuration.
- Database foundation.
- Synthetic seed.
- Design tokens.
- Basic mobile shell.
- Four localization dictionaries.
- Shared AI provider interface.
- OpenAI and Anthropic configuration.

If authorized credentials are available, immediately test at least one live connection.

Do not spend more than a short, bounded period debugging external credentials.

Document blockers and continue with the demo engine if needed.

## Milestone 2 — First working AI vertical slice

Minutes 25–65.

Implement:

- Visually attractive Home.
- Initial discovery cards.
- Business context retrieval.
- Live contextual conversation.
- Deterministic fallback.
- Recommendation card.
- Financial evaluation.
- Initial experiment creation.

Acceptance:

A restaurant owner can discover an idea, ask a question and turn the recommendation into an experiment.

## Milestone 3 — Complete business learning loop

Minutes 65–115.

Implement:

- Financial engine.
- Experiment lifecycle.
- Record results.
- Persistent learning.
- Both outcome scenarios.
- Linked next recommendations.
- Critical unit tests.

Acceptance:

Both outcomes produce different recommendations through the same working pipeline.

## HARD CHECKPOINT — MINUTE 115

If the complete loop is not working:

Freeze optional features.

Do not build the thesis website.

Do not add advanced speech.

Do not add unrelated integrations.

Complete and stabilize the primary journey.

## Milestone 4 — Visual and multilingual excellence

Minutes 115–160.

Implement:

- Complete visual discovery content.
- Relevant local imagery.
- Premium mobile cards.
- Visual financial breakdown.
- Experiment timeline.
- Visual learning summary.
- English.
- Hinglish.
- Hindi.
- Kannada.
- Language switching.
- Natural code-switching.

Validate all primary mobile screens.

## Milestone 5 — AI enhancement and voice

Minutes 160–185.

Implement or verify:

- Live contextual follow-up questions.
- AI interpretation of stored results.
- Structured recommendations.
- Second provider where feasible.
- Browser read-aloud.
- Voice input if supported.

Use Gnani only if the core journey is already stable.

## Milestone 6 — Testing and competition readiness

Minutes 185–215.

- Automated tests.
- Financial verification.
- Mobile layout validation.
- Four-language validation.
- Live AI verification.
- Screenshots.
- Actual browser recording.
- GitHub preparation.
- Judging criteria audit.
- Stable final checkpoint.

## Milestone 7 — Rehearsal and submission

Minutes 215–240.

- Rehearse.
- Verify demo fallback.
- Review all five criteria.
- Prepare final submission.
- Push code if authorized.
- Confirm actual product links.

No risky major changes.

## Post-build milestone

Only after the working product is validated:

- Product thesis documentation.
- Investor-facing website.
- GitHub Pages deployment preparation.

---

# 35. PRIORITY FRAMEWORK

## P0 — Competition-critical

- Working application.
- Persistent business context.
- Visual discovery.
- Functional conversation.
- At least one verified live AI provider, subject to credentials.
- Natural Hinglish interaction.
- English, Hindi and Kannada retained.
- Four-language selection and switching.
- Correct financial calculations.
- Complete experiment lifecycle.
- Outcome-sensitive learning.
- Premium mobile visual experience.
- Reliable credential-free fallback.
- Demo reset.

## P1 — Strongly desired

- Second provider verification.
- Browser read-aloud.
- Browser voice input.
- Responsive analytics.
- Automated browser tests.
- Walkthrough recording.
- GitHub-ready source.
- Judging alignment documentation.

## P2 — Post-build

- Product thesis document.
- Investor-facing static website.
- GitHub Pages.

## P3 — Stretch

- Gnani voice integration.
- Advanced voice conversation.
- Additional discovery sources.
- Extended business functionality.

Cut scope from the bottom upward.

---

# 36. OUT OF SCOPE

Do not build:

- Actual payment execution.
- Actual advertising campaigns.
- Full restaurant POS.
- Inventory management.
- Delivery order management.
- Complex enterprise analytics.
- Unverified competitor intelligence.
- Complex multi-agent orchestration.
- Additional industry verticals.
- Elaborate onboarding.
- Separate light theme.
- Unnecessary administration screens.

---

# 37. AUTOMATED TESTING

Run:

- TypeScript validation.
- Lint.
- Production build.
- Vitest.
- Playwright.

## Unit tests

Verify:

- Exact expected financial calculations.
- Below-target results.
- Above-target results.
- Promotion break-even.
- Invalid inputs.
- Lifecycle transitions.
- Learning rules.
- Loss-making guardrails.
- Idempotent seed.
- Demo reset.
- Localization key completeness.
- Representative intent matching.
- AI structured-output validation.

## Four browser test scenarios

Test 1:

Complete credential-free mobile journey.

Test 2:

Different outcomes generate different recommendations.

Test 3:

All four language preferences preserve business state and avoid mobile overflow.

Test 4:

Demo reset restores the initial fictional state.

Use 390 × 844 and 360 × 800 viewports.

Verify persistence across refreshes.

Report actual executed test results.

Do not fabricate passing tests.

---

# 38. VISUAL QUALITY AUDIT

Inspect actual rendered screenshots.

Verify:

- No overflow.
- No clipped text.
- Readable Hindi and Kannada.
- Natural Hinglish wrapping.
- Consistent spacing.
- Consistent card styling.
- Working navigation.
- Appropriate imagery.
- No broken image links.
- Clear primary actions.
- Keyboard-safe chat.
- Accessible contrast.
- Clear progress states.
- No excessive animation.
- No unfinished placeholders in the primary demonstration journey.

Fix visible defects.

Do not merely generate screenshots without inspecting them.

---

# 39. SCREENSHOTS AND RECORDING

Capture actual screens:

- Language selection.
- English Home.
- Hinglish Home.
- Hindi Home.
- Kannada Home.
- Discovery.
- Visual opportunity.
- Ask Udaan.
- Live AI response.
- Financial evaluation.
- Experiment setup.
- Results.
- Learning.
- Next recommendation.
- AI provider settings.

Record one actual mobile browser walkthrough.

Use 390 × 844.

Record:

1. Launch.
2. Select Hinglish.
3. Discover an opportunity.
4. Ask Udaan.
5. Review recommendation.
6. Evaluate costs.
7. Start experiment.
8. Record results.
9. Review learning.
10. Switch language.
11. View next recommendation.

Show alternative outcome if practical.

Store video, screenshots and sanitized test evidence.

Playwright video may not contain audio.

Do not claim voice recording unless actual audio was captured.

---

# 40. GITHUB STRATEGY

Proposed repository:

amit1858/udaan-ai

Confirm availability.

Use authorized GitHub connection.

Do not request tokens in chat.

Initially keep repository private.

Use frequent working commits or checkpoints.

Suggested commits:

- Initialize Udaan.
- Add business context and AI providers.
- Add discovery and experiment workflow.
- Implement outcome-driven learning.
- Complete multilingual visual experience.
- Add tests and competition documentation.
- Prepare product thesis website.

Do not overwrite existing repositories.

Do not force-push.

Check for secrets before pushing.

Push only with explicit authorization.

Public publication requires separate authorization and compliance with event rules.

---

# 41. REPOSITORY STRUCTURE

Suggested structure:

udaan-ai/
  app/
  components/
  lib/
    ai/
    voice/
    finance/
    discovery/
    experiments/
    learning/
    localization/
  locales/
    en.json
    hinglish.json
    hi.json
    kn.json
  prisma/
  public/
    images/
    illustrations/
  tests/
  docs/
    ARCHITECTURE.md
    IMPLEMENTATION_STATUS.md
    JUDGING_ALIGNMENT.md
    TEST_REPORT.md
    PRODUCT_THESIS.md
    DEMO_SCRIPT.md
    KNOWN_LIMITATIONS.md
  website/
    index.html
    styles.css
    assets/
  artifacts/
    review/
  .github/
    workflows/
      ci.yml
      pages.yml
  UDAAN_MASTER_SPEC.md
  README.md
  .env.example
  .gitignore

Adapt paths to framework conventions.

Do not create unnecessary empty modules.

Exclude credentials, tokens, private data, dependency directories, build caches, sensitive databases, large recordings and sensitive traces.

Use reproducible migrations and synthetic seeds.

---

# 42. PRODUCT THESIS DOCUMENT

Create docs/PRODUCT_THESIS.md after validating the working application.

Include:

- Human story.
- Customer problem.
- RFS 76 alignment.
- Product vision.
- Target persona.
- Product experience.
- Why now.
- AI differentiation.
- Technical architecture.
- Commercial opportunity.
- Retention hypothesis.
- Expansion hypothesis.
- Roadmap.
- Actual implementation status.
- Known limitations.

Commercial hypothesis:

Freemium subscription with potential paid pricing of ₹299–499 per month.

Clearly label pricing as unvalidated.

Retention hypothesis:

Owners return because Udaan retains business context, introduces relevant possibilities and learns from their actual experiments.

Initial market:

Independent restaurants and cafés.

Future expansion:

Bakeries, retailers, salons and other small businesses.

Do not fabricate traction, revenue, customers, market size, endorsements or willingness to pay.

---

# 43. PREMIUM PRODUCT THESIS WEBSITE

After the working product is complete, build a separate investor-facing static website.

Location:

website/

Hosting target:

GitHub Pages.

Design reference:

https://amit-pandey-ai-hub.netlify.app/

The website should look like a credible early-stage AI startup.

Use:

- Premium dark AI aesthetic.
- Large cinematic hero.
- Human-centric imagery.
- Elegant editorial typography.
- Cyan and lime accents.
- Actual mobile product screenshots.
- Interactive architecture illustrations.
- Animated visual product journey.
- Strong whitespace.
- Thoughtful micro-interactions.
- Responsive layouts.

## Required sections

1. Hero.

Headline:

Every small business deserves a big possibility.

Supporting message:

An AI companion that understands your business, speaks your language, and grows with you.

CTA:

Try Udaan.

2. The human problem.

Tell Ravi's story.

3. The product experience.

Show actual screenshots.

4. From curiosity to growth.

Animate the discover-to-learning cycle.

5. Ambition speaks every language.

Show English, Hinglish, Hindi and Kannada.

6. Three signature capabilities.

It understands me.

It opens new possibilities.

It grows with me.

7. AI differentiation.

Explain business context, structured recommendations, transparent calculations and outcome-sensitive learning.

8. Technology architecture.

Show:

Mobile experience.

Multilingual AI conversation.

OpenAI / Anthropic / Demo Engine.

Business memory.

Financial engine.

Experiment lifecycle.

Learning engine.

Optional voice.

9. Business thesis.

Target market, subscription hypothesis and expansion strategy.

10. Roadmap.

Distinguish implemented, tested and planned functionality.

11. Origin.

Created in response to RFS 76 at the Product (Un)Conference.

Do not imply endorsement, investment or partnership.

12. Calls to action.

Working product.

Actual demo recording.

GitHub repository.

Product thesis.

Only enable valid and authorized links.

Do not fabricate screenshots.

---

# 44. GITHUB PAGES

Use static HTML, CSS and minimal JavaScript or a compatible static export.

Ensure:

- Repository-relative assets.
- Responsive layouts.
- Accessible navigation.
- Open Graph metadata.
- Optimized imagery.
- Valid links.
- Reduced-motion support.

Prepare GitHub Actions workflow.

Expected URL, subject to configuration:

https://amit1858.github.io/udaan-ai/

GitHub Pages hosts the product thesis website only.

The full application remains on Replit or another authorized backend-capable host.

Do not deploy without authorization.

---

# 45. SECURITY AND CREDENTIALS

Create .env.example with placeholders only.

DATABASE_URL=

OPENAI_API_KEY=

OPENAI_MODEL=

ANTHROPIC_API_KEY=

ANTHROPIC_MODEL=

GNANI_API_KEY=

DEFAULT_AI_PROVIDER=demo

ALLOW_PAID_API_CALLS=false

Use the actual Gnani credential names supported by verified documentation.

Store credentials in Replit Secrets.

Never expose credentials in:

- Client code.
- Responses.
- Network payloads to the browser.
- Logs.
- Screenshots.
- Videos.
- Browser traces.
- Git commits.
- Review archives.

Obtain explicit authorization for bounded paid API testing.

Implement timeouts, bounded outputs and request rate limits.

Protect provider-test endpoints.

Do not automatically invoke both models.

Do not bypass provider spending controls.

---

# 46. IMPLEMENTATION GOVERNANCE

Maintain docs/IMPLEMENTATION_STATUS.md.

Record:

- Completed requirements.
- Pending requirements.
- Tested requirements.
- Blockers.
- Modules changed.
- Tests executed.
- Passed tests.
- Failed tests.
- Known defects.
- Working checkpoint.
- Deviations.
- Remaining time priorities.

Maintain docs/JUDGING_ALIGNMENT.md.

For each judging criterion, record:

- Implemented capability.
- Demonstration evidence.
- Test evidence.
- Known gaps.
- Recommended final improvement.

Re-read relevant specification sections before each milestone.

Do not rely solely on chat history.

---

# 47. THREE-MINUTE COMPETITION DEMO

Prepare a concise, human-led demonstration.

## Opening — 20 seconds

"Meet Ravi. Every morning he opens his restaurant, serves customers, manages staff and pays bills. He dreams of growing his business, but when does he get time to discover what is possible?"

## Product introduction — 20 seconds

"That is why I built Udaan — an AI companion that understands your business, speaks your language, and grows with you."

Show the visually rich mobile Home.

## Discovery moment — 35 seconds

Show office breakfast subscriptions.

Explain why this unfamiliar business possibility could be relevant.

## Live AI moment — 40 seconds

Ask in Hinglish:

"Mere restaurant mein weekdays par customers kam aa rahe hain. Kya karun?"

Show contextual live AI response.

Show the visual breakfast-combo recommendation.

## Working learning moment — 45 seconds

Evaluate the costs.

Start the experiment.

Record sample results.

Show the learning and next recommendation.

Show the alternative result briefly.

## Multilingual moment — 10 seconds

Switch to Kannada or Hindi.

Preserve business state.

## Closing — 10 seconds

"Most business software helps owners manage what their business is today. Udaan helps them imagine what their business could become tomorrow."

Rehearse the complete flow.

Adjust timing if official demo duration differs.

Do not spend stage time explaining every feature.

Show the product.

---

# 48. FINAL JUDGING AUDIT

Before submission, verify:

## It works

Can a judge complete the core journey?

Does persistence work?

Are there visible defects?

## Problem & User

Does the experience clearly solve the original discovery problem?

Does it communicate in the owner's language?

## Product Sense

Is the journey intuitive, focused and visually coherent?

Does every major feature serve the customer?

## Use of AI

Has at least one real AI provider been verified?

Does AI receive business context?

Can AI interpret historical outcomes?

Is this more than generic chat advice?

## Demo

Does the story create emotional connection?

Is there a memorable discovery moment?

Is there a visible learning moment?

Is there a backup recording?

Record actual gaps.

Fix the highest-impact gaps first.

Do not claim official scores.

---

# 49. FINAL REVIEW PACKAGE

Create:

artifacts/review/

Include:

- Product summary.
- Feature completion matrix.
- Judging alignment.
- Architecture.
- Visual design review.
- Functional audit.
- Four-language validation.
- Provider verification.
- Financial verification.
- Unit and browser tests.
- Screenshots.
- Actual browser walkthrough.
- Demo script.
- Known limitations.

If supported, create:

Udaan_AI_Hackathon_Review_Pack.zip

Exclude secrets, private data, dependency folders, caches, Git internals and sensitive traces.

Verify that the archive is readable.

---

# 50. DEFINITION OF DONE

The working product is competition-ready when a judge can:

1. Open the mobile application.
2. Choose from four language preferences.
3. Discover a visually presented new business possibility.
4. Understand why it fits the restaurant.
5. Ask a contextual question.
6. Receive a meaningful AI recommendation.
7. Evaluate the financial implications.
8. Approve and start an experiment.
9. Record results.
10. See what happened.
11. Understand what was learned.
12. Receive a linked next recommendation.
13. Demonstrate a different outcome.
14. Switch languages without losing context.

At least one live AI provider should be genuinely verified before judging, subject to credential availability and authorization.

The complete deterministic demonstration must remain independently functional.

The product must look visually polished.

The GitHub repository and product thesis website must be prepared without compromising the competition submission.

---

# 51. FINAL EXECUTION DIRECTIVE

Build Udaan AI now.

Do not wait for routine approval.

Follow the incremental implementation plan.

Prioritize the five official judging criteria.

Make the AI experience genuine.

Make the visual experience exceptional.

Make the business logic correct.

Make the owner experience approachable.

Protect the complete discovery-to-learning journey.

Use English, Hinglish, Hindi and Kannada.

Use OpenAI and Anthropic through a shared architecture.

Verify at least one live provider early.

Preserve reliable Demo Mode.

Prepare clean source code for GitHub.

Create the beautiful investor-facing product thesis website after the working application is stable.

Do not overbuild.

Do not silently deviate.

Do not sacrifice the demo.

Qualifying among the top six is the competition objective, not a guaranteed outcome.

The product objective is to give small-business owners the intelligence, inspiration and confidence to imagine a better future.

Inspiration becomes action.

Action creates evidence.

Evidence creates learning.

Learning opens new possibilities.

UDAAN AI — EVERY SMALL BUSINESS DESERVES A BIG POSSIBILITY.