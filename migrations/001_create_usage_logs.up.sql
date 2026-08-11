-- Migration: 001_create_usage_logs
-- Description : creation de la table usage_logs (tracabilite des usages des fonctionnalites)
-- Sens : up

CREATE TABLE IF NOT EXISTS usage_logs (
  id INTEGER PRIMARY KEY,
  username TEXT,
  feature TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
  detail TEXT,
  occurred_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_username ON usage_logs (username);
CREATE INDEX IF NOT EXISTS idx_usage_logs_occurred_at ON usage_logs (occurred_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_feature ON usage_logs (feature);
