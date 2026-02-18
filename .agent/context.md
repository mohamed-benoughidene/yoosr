# TileDesk Clone - Project Context

## Project Overview
Building a customer support platform clone of TileDesk using modern stack:
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Convex (PostgreSQL, Auth, Realtime, Storage)
- **State Management:** React Query (TanStack Query)
- **UI Components:** shadcn/ui

## Project Goal
Create a full-featured customer support SaaS with:
- Live chat widget
- Multi-channel support (WhatsApp, Telegram, Web)
- AI chatbot engine
- Agent dashboard
- Knowledge base with RAG
- Real-time messaging

## Original Reference
This is a clone/adaptation of TileDesk (open-source project):
- Original: Angular + Node.js/Express + MongoDB + RabbitMQ/MQTT
- Our Stack: Next.js + Supabase (PostgreSQL + built-in Realtime)
- Reference code: `./reference/original-repos/`

## Architecture Principles
1. **Server Components First:** Use Next.js Server Components by default
2. **Client Components Only When Needed:** For interactivity, real-time, state
3. **Database Security:** Always use Supabase RLS (Row Level Security)
4. **Type Safety:** Full TypeScript, generate types from Supabase schema
5. **Real-time Pattern:** Supabase Realtime subscriptions, not MQTT
6. **Multi-tenancy:** Project-based isolation with RLS policies
