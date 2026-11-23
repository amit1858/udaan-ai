-- OPTIONAL ONE-TIME DATA EXPORT, not a job, migration or backup table.
-- Run only in the intended Production read-only SQL view; download the result
-- privately as JSON/CSV. Never commit the result or add this query to startup.
-- Seven application tables, one MVCC query snapshot; a replica can lag primary.
-- No roles, schema, privileges or _prisma_migrations are exported.
SELECT json_build_object(
  'format', 'udaan-row-export-v1',
  'source', 'production-read-replica',
  'snapshot_at', CURRENT_TIMESTAMP,
  'database', current_database(),
  'postgres_version', current_setting('server_version'),
  'tables', json_build_object(
    'DemoSession', (SELECT coalesce(json_agg(t), '[]'::json) FROM public."DemoSession" t),
    'Sale', (SELECT coalesce(json_agg(t), '[]'::json) FROM public."Sale" t),
    'Experiment', (SELECT coalesce(json_agg(t), '[]'::json) FROM public."Experiment" t),
    'ChatMessage', (SELECT coalesce(json_agg(t), '[]'::json) FROM public."ChatMessage" t),
    'ProviderCall', (SELECT coalesce(json_agg(t), '[]'::json) FROM public."ProviderCall" t),
    'VoiceLabConfig', (SELECT coalesce(json_agg(t), '[]'::json) FROM public."VoiceLabConfig" t),
    'VoiceRequest', (SELECT coalesce(json_agg(t), '[]'::json) FROM public."VoiceRequest" t)
  )
) AS export_json;
