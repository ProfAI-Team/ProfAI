-- Phase 7 task 7.3 — enable pgvector so the Phase 7 tables created in
-- migration 20260419_phase_7 (Tutor.embedding, MarketplaceItem.embedding)
-- have the operator + index support they need. Splitting the extension
-- into its own migration keeps the schema-structural migration reviewable
-- and lets us apply the extension in CI before Prisma introspects the
-- vector columns.

CREATE EXTENSION IF NOT EXISTS vector;
