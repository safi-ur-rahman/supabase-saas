# Full-Stack AI Task Management SaaS Platform

A modern, full-stack, event-driven SaaS task management application built using **Next.js**, **Supabase (Postgres)**, and **Stripe**. The platform showcases secure user provisioning, automated AI task contextualization, dynamic database usage meters, and an end-to-end subscription ledger billing lifecycle.

---

## System Architecture & Tech Stack

```
               [ Next.js Frontend (App Router) ]
                                |
         +----------------------+----------------------+
         | (Auth JWT)           | (RPC / REST)         | (Edge Invoke)
         v                      v                      v
 [ Supabase Auth ]      [ Postgres DB / RLS ]   [ Deno Edge Functions ]
 (Google OAuth 2.0)     (Schema & Migrations)   (OpenAI & Stripe Portal)
                                                       |
                                                       v
                                            [ Webhook Events Loop ]
                                            (Stripe -> DB Provision)

```

* **Frontend:** Next.js (App Router, Server Actions), Tailwind CSS, Shadcn UI, Lucid Icons.
* **Backend-as-a-Service:** Supabase (Auth, Postgres DB, Row Level Security, Storage, Edge Functions).
* **Payment Infrastructure:** Stripe API (Hosted Checkout, Dynamic Customer Billing Portal).
* **Artificial Intelligence:** OpenAI API (Automated metadata task processing and auto-labeling).

---

## Core Platform Engineering Features

### Enterprise Authentication & Provisioning

* Integrated **Google OAuth 2.0 via Google Cloud Console** alongside native Supabase credentials.
* Implemented a master database `handle_new_user_signup()` trigger. On identity verification, Postgres automatically provisions custom `public.accounts` rows and seeds a secure local lowercase `'free'` entry in the `account_subscriptions` ledger.

### 🗄️ Relational Schema, RLS, & Migrations

* **Version-Controlled Database Schema:** Built across a highly optimized three-table relational layout (`accounts`, `account_subscriptions`, `tasks`).
* **Granular Security Data Isolation:** 100% compliant with PostgreSQL Row-Level Security (RLS) policies ensuring cross-tenant isolation vectors—users can strictly interact with data matching their active `auth.uid()`.
* **Supabase Storage Engine:** Integrated bucket parameters restricted by fine-tuned SQL policies defining strict maximum byte-sizes and image MIME-type bounds.

### ⚡ Event-Driven Serverless Edge Functions

* **`create-stripe-session`:** Evaluates backend data conditions to route users. Free-tier users seamlessly spin up localized Stripe Checkout sessions using `client_reference_id` metadata tracking. Premium tier users bypass checkout and route instantly into Stripe's Self-Service Management Portal.
* **`stripe-webhook`:** A cryptographic SubtleCrypto-protected endpoint handling asynchronous events like `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted` to keep the DB in perfect parity with billing lifecycles.
* **AI Context Auto-Labeling:** Leverages OpenAI models inside serverless routines to compute metadata contexts on incoming entries dynamically.

---

## Environment Variables Configuration

To run this platform locally or execute cloud builds, populate the following parameters in your local environment file (`.env.local` for Next.js, and Supabase Secrets Vault for serverless functions):

### Next.js & Supabase Master Client Coordinates

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_pub_..."

```

### Serverless Crypto Keys & Third-Party APIs

```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PRICE_ID="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
OPENAI_API_KEY="sk-proj-..."

```

---

## Local Development Orchestration

### 1. Initialize and Spin Up Containerized Services

Ensure you have the Supabase CLI installed, then boot the local emulation stack environment:

```bash
supabase start

```

### 2. Apply Schema Updates and Local Migrations

Apply version-controlled database schemas, baseline triggers, and security parameters across the running Postgres cluster:

```bash
supabase migration up

```

### 3. Deploy Serverless Backend Edge Functions

```bash
supabase functions deploy create-stripe-session
supabase functions deploy stripe-webhook

```

### 4. Create an Encrypted Stripe Tunnel Gateway

To execute the backend lifecycle locally, pipe production test events straight down into your local edge loop:

```bash
stripe login
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

```

> Capture the returned `whsec_...` configuration token and apply it to your database secrets via `supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..."`.

### 5. Start the Web App Frontend

```bash
npm install
npm run dev

```

---

## System Verification

The platform ships equipped with an integrated automation test layout suite to maintain continuous verification of active RLS tables, transactional mutations, and routing boundaries:

```bash
# Execute native platform validation routines
npm run test

```

---

## 📌 Project Status Notice

> **Note:** Frontend task creation functionality (`Add Task` actions) has been intentionally left unimplemented in this repository.
> The core goal of building this application was to master high-impact backend infrastructure patterns—specifically **Google OAuth provisioning loops**, **Postgres Row-Level Security (RLS)**, **cryptographic Stripe Webhook lifecycle pipelines**, and **Deno Edge Function execution contexts**. Having successfully implemented, secured, and validated these core full-stack SaaS orchestration blocks, this codebase serves as a completed learning milestone as I transition focus toward advanced AI Engineering concepts.