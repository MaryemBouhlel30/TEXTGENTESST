-- Migration: 001_create_usage_logs
-- Description : annulation de la creation de la table usage_logs
-- Sens : down (rollback)

DROP INDEX IF EXISTS idx_usage_logs_feature;
DROP INDEX IF EXISTS idx_usage_logs_occurred_at;
DROP INDEX IF EXISTS idx_usage_logs_username;

DROP TABLE IF EXISTS usage_logs;
