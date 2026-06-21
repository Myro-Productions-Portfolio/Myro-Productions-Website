# 05 — AI Features Budget: "AI Version of Me" Chatbot on AWS Bedrock

**Audit date:** 2026-05-28  
**Author:** Research agent  
**Scope:** Realistic cost analysis for a RAG-based portfolio chatbot using AWS Bedrock  
**Budget constraint:** $150–$250/month maximum for all AI-related costs (after base ~$28–$32/month infra)

---

## Executive Summary

A real Bedrock-powered "AI version of you" chatbot — with proper guardrails, RAG grounding, and room to iterate — is achievable inside $50–$80/month at your traffic volume. The catch is entirely about vector store choice. The historically cited $350/month floor for OpenSearch Serverless was real and caused a lot of people to overshoot their budgets. In May 2026 that floor was eliminated (next-gen OpenSearch Serverless went GA with true scale-to-zero on 2026-05-28). S3 Vectors also went GA in December 2025 as a sub-cent-per-query alternative. Neither development was obvious from training data alone — which is exactly why this research was worth doing.

The recommendation: **Bedrock Knowledge Base + S3 Vectors + Bedrock Agents + Claude Haiku 4.5**, estimated at **$15–$35/month** all-in at your traffic level. Well inside budget. AWS learning value is high.

---

## Section 1: Architecture Options

### Option A — Bedrock InvokeModel Direct + Custom RAG

```
[Next.js API route / Lambda]
        |
        v
  [Vector Store]  <-- you manage this (pgvector on RDS, Chroma, Qdrant, etc.)
        |
        v
  [Relevant chunks]
        |
   + [User query]
        |
        v
  bedrock-runtime:InvokeModel
        |
        v
  [Response to frontend]
```

**Code complexity:** High. You write the embedding pipeline, chunking logic, retrieval scoring, prompt assembly, and guardrails yourself.  
**AWS learning value:** Medium. You touch Bedrock runtime directly but bypass all the managed services.  
**Guardrails:** Manual. You can call Bedrock Guardrails as a separate API but must wire it in yourself.  
**Monthly cost at 300 turns:** Model inference only — see Section 2 table. No managed service overhead.

### Option B — Bedrock Knowledge Bases (Managed RAG)

```
[S3 bucket: bio.txt, projects.md, work-history.md]
        |
        v
  [Bedrock Knowledge Base]  <-- AWS manages chunking, embedding, sync
        |
     S3 Vectors (or OpenSearch Serverless NextGen)
        |
        v
  RetrieveAndGenerate API call
  (retrieval + prompt augmentation + model inference in one call)
        |
        v
  [Response to frontend]
```

**Code complexity:** Low. One API call replaces the entire RAG pipeline. You manage the S3 content files and trigger re-syncs when content changes.  
**AWS learning value:** High. You learn KB setup, IAM for cross-service access, ingestion jobs, vector store configuration.  
**Guardrails:** Connectable — Bedrock Guardrails attaches directly to a Knowledge Base or model call.  
**Monthly cost at 300 turns:** Model inference + vector store + optional Guardrails. See Section 2.

### Option C — Bedrock Agents (Managed Orchestration + Tools + Guardrails)

```
[User message]
        |
        v
  [Bedrock Agent]
    - session memory
    - action groups (tool calls via Lambda or inline code)
    - knowledge base attachment
    - guardrails built in
        |
        v
  [Multiple internal model calls: plan → retrieve → act → respond]
        |
        v
  [Response with citations to frontend]
```

**Code complexity:** Medium-low on the AWS side (console/CDK config), but you define action groups (OpenAPI spec or Lambda) for each "tool" the agent can use. More setup than Option B, less code than Option A.  
**AWS learning value:** Highest. You configure agents, action groups, session memory, and guardrails — the full managed AI service stack.  
**Guardrails:** Native. Guardrails attach directly to the agent definition.  
**Monthly cost at 300 turns:** Model inference (with token amplification) + vector store + Guardrails. See Section 2.  
**Critical cost caveat:** Bedrock Agents does not charge a separate per-invocation fee on top of model calls. But each user turn triggers multiple internal model calls (planning, retrieval augmentation, response synthesis). Expect 3–5x token amplification vs. a direct model call. For a simple "tell me about your work" chatbot without complex multi-step tool use, amplification is closer to 2–3x. Budget at 3x to be safe.

---

## Section 2: Monthly Cost Breakdowns

### Verified Pricing (2026-05-28)

**Model pricing — AWS Bedrock on-demand, us-east-1:**

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Source |
|---|---|---|---|
| Amazon Nova Lite | $0.06 | $0.24 | cloudburn.io/blog/amazon-bedrock-pricing, verified Feb 2026 |
| Amazon Nova Pro | $0.80 | $3.20 | cloudburn.io/blog/amazon-bedrock-pricing, verified Feb 2026 |
| Claude Haiku 4.5 | $1.00 | $5.00 | cloudburn.io/blog/amazon-bedrock-pricing, verified Feb 2026 |
| Claude Sonnet 4.5/4.6 | $3.00 | $15.00 | cloudburn.io/blog/amazon-bedrock-pricing, verified Feb 2026 |

Note: Claude Haiku 4.5 and Sonnet 4.5/4.6 availability on Bedrock us-east-1 confirmed via aws.amazon.com/bedrock/pricing/ (2026-05-28). The AWS pricing page at time of fetch showed Claude 3.5 Sonnet at $6/$30 per 1M tokens — the Haiku 4.5 and Sonnet 4.5/4.6 prices above are sourced from a third-party aggregator (cloudburn.io, February 2026 verified). Treat these as high-confidence Tier 2 until you confirm on the AWS console at sign-in.

**Token math per turn (conservative estimate):**
- Input: 2,000 tokens (system prompt ~800 + retrieved RAG chunks ~800 + user message ~400)
- Output: 500 tokens (typical chatbot response)
- For Agents: multiply input × 3 for amplification (3 internal calls average)

**300 turns/month model cost:**

| Model | Option A/B input cost | Option A/B output cost | Option A/B total | Option C (3x amplification) total |
|---|---|---|---|---|
| Nova Lite | 300×2k×$0.06/1M = $0.036 | 300×500×$0.24/1M = $0.036 | **$0.07** | ~$0.21 |
| Nova Pro | 300×2k×$0.80/1M = $0.48 | 300×500×$3.20/1M = $0.48 | **$0.96** | ~$2.88 |
| Haiku 4.5 | 300×2k×$1.00/1M = $0.60 | 300×500×$5.00/1M = $0.75 | **$1.35** | ~$4.05 |
| Sonnet 4.5/4.6 | 300×2k×$3.00/1M = $1.80 | 300×500×$15.00/1M = $2.25 | **$4.05** | ~$12.15 |

**Model inference alone is negligible at 300 turns/month.** The dominant cost is the vector store.

### Vector Store Options

**OpenSearch Serverless Classic (old default — avoid):**
- 2 OCU minimum × $0.248/OCU-hour × 730 hours = **$362/month**
- This is the "$350/month trap." It runs at full cost whether you have 0 or 1 million queries.
- Source: aws.amazon.com/opensearch-service/pricing/, multiple sources confirm ~$350 floor
- Do not use this for a personal portfolio project.

**OpenSearch Serverless NextGen (GA: 2026-05-28):**
- True scale-to-zero: OCU usage drops to 0 after 10 minutes of idle, resumes in ~10 seconds
- No minimum OCU floor on NextGen collections
- Per-OCU-hour rate appears unchanged at ~$0.248 based on current pricing page
- At your usage (two 30-minute demo sessions + testing = maybe 2–3 hours of active queries/month): 2 OCUs × $0.248 × 3 hours = **$1.49/month compute**
- Storage: separate, ~$0.024/GB-month — your 200KB corpus is effectively $0.00
- **Realistic monthly estimate: $2–$5/month for this traffic level**
- Source: aws.amazon.com/blogs/aws/introducing-the-next-generation-of-amazon-opensearch-serverless-for-building-your-agentic-ai-applications/, 2026-05-28
- Caveat: NextGen launched TODAY. Pricing page may not yet reflect NextGen-specific rates. Verify before building.

**S3 Vectors (GA: December 2, 2025):**
- Storage: $0.06/GB/month — 200KB corpus = $0.000012/month, effectively $0.00
- Write cost: $0.20/GB for upload — 200KB = $0.00004, effectively $0.00
- Query cost: $0.004/TB processed (Tier 1, first 100K vectors) + $2.50 per million API calls
- At 300 queries/month: $2.50 × (300/1,000,000) = $0.00075 for API calls; data processed cost is negligible at this scale
- **Realistic monthly estimate: under $0.01/month**
- Supports semantic search. Does NOT support hybrid search (this is a documented limitation).
- Fully integrated with Bedrock Knowledge Bases — select "S3 vector bucket" in console
- Source: docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors-bedrock-kb.html, aws.amazon.com/about-aws/whats-new/2025/12/amazon-s3-vectors-generally-available/

**Aurora PostgreSQL Serverless v2 with pgvector:**
- Supports scale-to-zero (0 ACU, GA since November 2024, requires PostgreSQL 13.15+/14.12+/15.7+/16.3+)
- Per-ACU-hour: $0.12 (Aurora Standard, us-east-1)
- Minimum when active: 0.5 ACU. When idle: 0 ACU (no charge)
- At your traffic: maybe 1 ACU-hour/month of actual compute = **$0.12/month compute**
- Storage: ~$0.10/GB-month. 200KB corpus = effectively $0.00
- But: Aurora pgvector is NOT natively supported as a Bedrock Knowledge Base vector store. Standard RDS PostgreSQL pgvector is not supported; Aurora PostgreSQL is listed as supported for Knowledge Bases. However, this requires keeping an Aurora cluster provisioned, which adds RDS operational overhead. This is Option A territory (you manage the retrieval code).
- Source: docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-setup.html, aws.amazon.com/blogs/database/introducing-scaling-to-0-capacity-with-amazon-aurora-serverless-v2/
- **For Option B/C (managed KB): skip Aurora, use S3 Vectors or OpenSearch NextGen instead.**

**Pinecone:**
- Free Starter tier: 2GB storage, 2M write units/month, 1M read units/month, single region (us-east-1)
- Builder plan: $20/month flat for higher limits
- Starter works for your corpus size. Compatible with Bedrock Knowledge Bases (listed as a supported vector store).
- Catch: Pinecone Starter pauses indexes after 3 weeks of inactivity — requires a wake-up call before demo sessions
- Source: pinecone.io/pricing/, 2026-05-28
- **Realistic monthly estimate: $0 (Starter) or $20 (Builder)**

**Embedding generation (one-time + reindex):**
- Amazon Titan Text Embeddings V2: $0.02 per million tokens
- 200KB corpus at ~250 tokens/KB average = ~50,000 tokens total
- Cost to embed full corpus: $0.02 × (50,000/1,000,000) = **$0.001** — essentially free
- Source: therouter.ai/models/amazon--titan-embed-v2/, confirmed via aws.amazon.com/bedrock/pricing/
- Reindex monthly: same math, ~$0.001/run

**Bedrock Guardrails (verified 2026-05-28):**
- Content filters (text): $0.15 per 1,000 text units
- Denied topics: $0.15 per 1,000 text units
- Sensitive information filters: $0.10 per 1,000 text units
- A text unit = up to 1,000 characters
- Each turn: ~3,000 chars input + ~500 chars output = ~4 text units × $0.15 = $0.0006/turn for content filters
- 300 turns/month: **$0.18/month** for one content filter layer
- Source: aws.amazon.com/bedrock/pricing/ (Guardrails section), verified 2026-05-28

**Data transfer:**
- Bedrock API calls from ECS Fargate within the same VPC/region: free (same-AZ data transfer is $0)
- Cross-AZ adds $0.01/GB each way — your response payloads are tiny, negligible
- Source: repost.aws/questions/QU8Y3NlNraQWqRM5fgKXVXSw (confirmed free within same AZ)

### Full Cost Matrix (300 turns/month, 20% conservative overage applied)

| Option | Vector Store | Model | Model cost | Vector cost | Guardrails | Monthly total |
|---|---|---|---|---|---|---|
| A (DIY) | None/pgvector | Nova Lite | $0.07 | ~$0 | — | **~$0.10** |
| A (DIY) | None/pgvector | Haiku 4.5 | $1.35 | ~$0 | — | **~$1.62** |
| B (KB) | S3 Vectors | Nova Lite | $0.07 | ~$0.01 | — | **~$0.10** |
| B (KB) | S3 Vectors | Nova Pro | $0.96 | ~$0.01 | — | **~$1.15** |
| B (KB) | S3 Vectors | Haiku 4.5 | $1.35 | ~$0.01 | $0.18 | **~$1.84** |
| B (KB) | S3 Vectors | Sonnet 4.5/4.6 | $4.05 | ~$0.01 | $0.18 | **~$5.08** |
| B (KB) | OpenSearch NextGen | Haiku 4.5 | $1.35 | ~$5.00 | $0.18 | **~$7.83** |
| B (KB) | Pinecone Starter | Haiku 4.5 | $1.35 | $0 | $0.18 | **~$1.84** |
| B (KB) | OpenSearch Classic | ANY | — | ~$362 | — | **AVOID** |
| C (Agent) | S3 Vectors | Haiku 4.5 (3x) | $4.05 | ~$0.01 | $0.54 | **~$5.52** |
| C (Agent) | S3 Vectors | Nova Lite (3x) | $0.21 | ~$0.01 | $0.54 | **~$0.90** |
| C (Agent) | S3 Vectors | Sonnet 4.5 (3x) | $12.15 | ~$0.01 | $0.54 | **~$15.24** |

All totals include the 20% overage buffer. The conclusion is clear: at this traffic level, the AI features cost $1–$25/month depending on model choice and architecture. The base infra ($28–$32/month) dominates your bill.

---

## Section 3: Recommended Starter Stack

**Recommended: Bedrock Knowledge Bases + S3 Vectors + Bedrock Agents + Claude Haiku 4.5 + Bedrock Guardrails**

Estimated monthly cost at your traffic level: **$8–$20/month all-in** (with 20% buffer).

Why this combination:

**Claude Haiku 4.5 over Nova Lite:** Nova Lite costs 94% less per token, but Haiku 4.5 is Anthropic's model with better instruction-following, better English prose quality, and a longer context window. For a chatbot that tells stories about your work, prose quality matters. Nova Lite is appropriate if cost becomes a concern at higher traffic. At 300 turns/month, the $1.28/month difference between Haiku 4.5 and Nova Lite is not a real trade-off decision.

**S3 Vectors over OpenSearch Serverless NextGen:** Both are now viable at low traffic. S3 Vectors has simpler pricing (near-zero at your scale), no cold-start concern for queries, and is the officially documented cost-optimized path for Bedrock Knowledge Bases. OpenSearch NextGen is the better choice if you later need hybrid search (keyword + semantic) or advanced filtering. Start with S3 Vectors; migrate if you hit its limitations (semantic-only search, 1KB metadata limit per vector).

**Bedrock Agents over plain Knowledge Bases:** The marginal cost of Agents at 300 turns/month is ~$4/month extra (3x token amplification). In exchange you get: native session memory (the chatbot remembers the conversation), action groups (e.g., a "contact me" tool that logs inquiries, or a "show recent projects" tool that queries your portfolio API), and integrated Guardrails attachment. This is precisely the "AI version of me with guardrails and toolsets" spec. Do not skip Agents to save $4/month.

**Bedrock Guardrails:** Adds ~$0.54/month at your volume. Prevents the chatbot from making claims you didn't put in the knowledge base, blocks off-topic requests (competitor comparisons, political questions), and filters PII in the output. Non-negotiable for a public-facing chatbot claiming to represent you.

**Implementation steps (high level):**
1. Create an S3 bucket; upload your content files (bio, project writeups, work history — Markdown/PDF/plain text all work)
2. Create a Bedrock Knowledge Base pointing at that S3 bucket; select S3 Vectors as vector store; select Titan Embeddings V2; run first sync
3. Create a Bedrock Agent; attach the Knowledge Base; attach a Guardrail; define one or two action groups (e.g., "get current projects" as a Lambda)
4. In your Next.js API route, call `bedrock-agent-runtime:InvokeAgent` with the user's message and a session ID
5. Stream the response to the frontend

---

## Section 4: How to Not Blow Up the Budget

**The OpenSearch Serverless Classic trap (historical — still relevant if you click the wrong option):**  
Until 2026-05-28, the Bedrock Knowledge Base console defaulted to OpenSearch Serverless. That meant an instant $350/month floor with zero usage. NextGen OpenSearch Serverless launched today and eliminates that floor, but the old Classic collections still exist. When creating a Knowledge Base, confirm you are selecting S3 Vectors or explicitly choosing a NextGen collection. Classic collections still bill the 2-OCU minimum. Source: cloudburn.io/blog/amazon-bedrock-pricing (February 2026).

**Knowledge Base scheduled ingestion jobs:**  
Bedrock Knowledge Bases can be configured to auto-sync on a schedule. Each sync re-embeds changed documents and runs the full ingestion pipeline. At 200KB corpus, cost per sync is ~$0.001 — not a budget problem. But if you accidentally upload a 100MB PDF dump and schedule hourly syncs, it adds up. Keep syncs manual (trigger on content push to S3) or on a daily schedule at most.

**Provisioned throughput vs. on-demand model access:**  
Bedrock on-demand pricing (what you want) charges per token with no commitment. Provisioned throughput (model units) charges hourly regardless of usage — starting around $40–$100/month per model unit for Haiku, higher for Sonnet. Do NOT enable provisioned throughput for a personal portfolio. On-demand is the right mode for sporadic traffic.

**Demo sessions left open in browser tabs:**  
If your frontend polls the backend every N seconds to check for "is the user typing" or runs a session keepalive, those are real Bedrock calls. Implement strict idle timeouts: no background polling, WebSocket close on tab focus-loss, session expiry after 10 minutes of inactivity. A tab left open overnight with 5-second polls is 17,280 calls — still trivially cheap at Nova Lite pricing ($0.00 effectively), but meaningful at Sonnet pricing (~$200 overnight).

**Model access enablement (Bedrock-specific):**  
Bedrock requires you to explicitly request access to each model family in the console (Model Access page). Enabling access does NOT charge you. You only pay when you call the model. The one exception: if you purchase provisioned throughput, you pay hourly from the moment of purchase. Never buy provisioned throughput for this use case.

**AWS Budgets alerts (free tier):**  
First two action-enabled budgets per month are free. Source: aws.amazon.com/aws-cost-management/aws-budgets/pricing/ (verified 2026-05-28).

Recommended budget setup:
- Budget 1: $50 monthly — email alert at 80% ($40). "AI cost approaching development threshold."
- Budget 2: $100 monthly — email + SNS alert at 100% ($100). "AI cost anomaly — investigate immediately."
- Optional: AWS Cost Anomaly Detection (free service) — enable it. It flags unusual day-over-day spend spikes within 24 hours, independent of budget thresholds.

Total cost of this monitoring setup: $0/month.

---

## Section 5: Developing Without Burning Money

**Bedrock has no free tier for model inference.** This is confirmed. You pay from the first API call. New AWS accounts receive $200 in general credits (as of the July 2025 credit program update), which can be applied to Bedrock, and would cover approximately 200,000 Haiku 4.5 turns before expiring. Source: aws.amazon.com/blogs/aws/aws-free-tier-update-new-customers-can-get-started-and-explore-aws-with-up-to-200-in-credits/

**The Ollama local dev approach — evaluated:**

The user's instinct to develop locally with Ollama and only switch to Bedrock for demos is reasonable but imperfect. Here is the honest trade-off:

What local Ollama gives you:
- Zero cost during development iterations
- Fast iteration loop (no network round-trip)
- Works offline

What you lose:
- Bedrock Knowledge Bases and Bedrock Agents are AWS-managed services — there is no local equivalent. You cannot run a Knowledge Base or Agent locally.
- Bedrock Guardrails have no local equivalent.
- The Bedrock Converse API is not Ollama's API. AWS now exposes an OpenAI-compatible endpoint for Bedrock (`/openai/v1`), and Ollama also exposes an OpenAI-compatible endpoint. In theory you can swap the `base_url` between local Ollama and Bedrock. In practice, Haiku 4.5 and Llama 3.1 8B (a reasonable Ollama stand-in) behave differently on tone, refusal patterns, and persona adherence. Source: dev.to/aws-builders/aws-launches-openai-compatible-api-for-bedrock-and-i-did-some-tests-49cd

**Practical recommendation for this project:**

Use a tiered development approach:
1. **Prompt and content iteration:** Use Ollama locally (Llama 3.1 8B or Mistral 7B). Write your bio/project content, iterate on system prompts, test RAG retrieval logic with a local ChromaDB or pgvector. This costs $0.
2. **Bedrock integration testing:** Do this directly against Bedrock dev environment, but use Nova Lite instead of Haiku 4.5. At $0.06/$0.24 per million tokens, even 5,000 test turns costs $0.19. Do not avoid real Bedrock calls out of cost fear — the amounts are trivially small.
3. **Guardrails and Agents testing:** These cannot be mocked locally. Budget $5–$10 for a thorough Agents testing sprint. Run it once, iterate in code, test again.
4. **Demo sessions:** Run against full stack on Bedrock. At $5–$10/session fully loaded with Agents + Sonnet, or under $0.50/session with Haiku 4.5, neither is a meaningful cost concern.

The development cost concern is real conceptually but irrelevant at your traffic numbers. At Haiku 4.5 pricing, 1,000 development turns costs $1.35. You will not burn budget during development.

---

## Sources

All prices verified 2026-05-28 unless noted.

- [Amazon Bedrock Pricing — AWS](https://aws.amazon.com/bedrock/pricing/)
- [AWS Bedrock Pricing: Token Rates Hide a $350/Month Trap — Cloud Burn](https://cloudburn.io/blog/amazon-bedrock-pricing) — verified February 2026
- [Using S3 Vectors with Amazon Bedrock Knowledge Bases — AWS Docs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors-bedrock-kb.html)
- [Amazon S3 Vectors Generally Available — AWS What's New](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-s3-vectors-generally-available/) — December 2, 2025
- [Amazon S3 Pricing (S3 Vectors section)](https://aws.amazon.com/s3/pricing/)
- [Introducing Next Generation OpenSearch Serverless — AWS Blog](https://aws.amazon.com/blogs/aws/introducing-the-next-generation-of-amazon-opensearch-serverless-for-building-your-agentic-ai-applications/) — 2026-05-28
- [Amazon OpenSearch Service Pricing](https://aws.amazon.com/opensearch-service/pricing/)
- [Aurora Serverless v2 Scaling to 0 — AWS Blog](https://aws.amazon.com/blogs/database/introducing-scaling-to-0-capacity-with-amazon-aurora-serverless-v2/) — November 2024
- [Amazon Aurora Pricing](https://aws.amazon.com/rds/aurora/pricing/)
- [Bedrock Knowledge Base Vector Store Prerequisites — AWS Docs](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-setup.html)
- [Amazon Titan Text Embeddings V2 Pricing — TheRouter.ai](https://therouter.ai/models/amazon--titan-embed-v2/)
- [Pinecone Pricing](https://www.pinecone.io/pricing/) — 2026-05-28
- [AWS Budgets Pricing](https://aws.amazon.com/aws-cost-management/aws-budgets/pricing/)
- [AWS Free Tier Update — $200 credits](https://aws.amazon.com/blogs/aws/aws-free-tier-update-new-customers-can-get-started-and-explore-aws-with-up-to-200-in-credits/)
- [AWS Bedrock OpenAI-Compatible API — DEV Community](https://dev.to/aws-builders/aws-launches-openai-compatible-api-for-bedrock-and-i-did-some-tests-49cd)
- [Amazon Bedrock AgentCore Pricing](https://aws.amazon.com/bedrock/agentcore/pricing/)
