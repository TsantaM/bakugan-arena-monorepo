-- =============================================================================
-- Bakugan Arena — Mise à jour BDD pour le decay ELO (colonne ranked sur rooms)
-- =============================================================================
-- À exécuter dans la console SQL de votre base PostgreSQL (Neon, pgAdmin, etc.)
-- Ce script est idempotent : vous pouvez le relancer sans erreur.
-- =============================================================================

-- 1. Ajouter la colonne ranked (false par défaut pour les parties existantes)
ALTER TABLE "rooms"
ADD COLUMN IF NOT EXISTS "ranked" boolean NOT NULL DEFAULT false;

-- 2. (Optionnel) Backfill : marquer les anciennes parties terminées comme ranked
--    Décommentez uniquement si TOUTES vos parties historiques en BDD étaient ranked
--    (pas de parties friendly / défi avant l'ajout du système de défis).
--
-- UPDATE "rooms"
-- SET "ranked" = true
-- WHERE "finished" = true
--   AND "winner" IS NOT NULL
--   AND "winner" <> '';

-- 3. Vérification
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'rooms'
  AND column_name = 'ranked';
