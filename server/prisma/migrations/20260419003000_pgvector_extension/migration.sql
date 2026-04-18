-- Phase 7 task 7.3 — enable pgvector so the Phase 7 tables created in
-- migration 20260419_phase_7 (Tutor.embedding, MarketplaceItem.embedding)
-- have the operator + index support they need. Splitting the extension
-- into its own migration keeps the schema-structural migration reviewable
-- and lets us apply the extension in CI before Prisma introspects the
-- vector columns.
--
-- `WITH SCHEMA public` pins the install to `public` regardless of the
-- current search_path. Prisma's `?schema=X` param sets search_path to
-- the connection's target schema, so omitting `WITH SCHEMA` would let
-- the first test_worker_N run install the extension into its own
-- schema, starving later workers (extensions are DB-wide singletons).
-- Qualifying the target makes the install deterministic.

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;
