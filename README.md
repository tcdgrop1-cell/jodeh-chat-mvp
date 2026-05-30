# Jodeh Chat MVP

WhatsApp-like UI, Telegram-like scaling model, and Supabase-backed data architecture for bilingual Arabic/English chat with hierarchy-aware membership.

## What's included
- React + Tailwind frontend scaffold
- 9-step registration wizard
- 19-digit hierarchy ID generator
- Profile card with copy-to-clipboard
- DMs / Groups / Channels chat shell
- Supabase SQL schema with trigger-based auto-membership

## Next setup steps
1. Connect Supabase project and run `supabase/schema.sql`
2. Wire `@supabase/supabase-js` client in the frontend
3. Replace demo rooms/messages with live queries and Realtime subscriptions
4. Add client-side encryption flow for message payloads

## Run locally
```bash
cd jodeh-chat
npm install
npm run dev
```
