-- Update provider storage usage to 1GB for testing limits
UPDATE provider_usage 
SET storage_used_mb = 1024, updated_at = NOW()
WHERE provider_id = '4500ad70-821f-44ea-85c5-d83140e98c6d'
  AND month = EXTRACT(MONTH FROM NOW())
  AND year = EXTRACT(YEAR FROM NOW());

-- If no usage record exists for this month, create one
INSERT INTO provider_usage (provider_id, month, year, storage_used_mb, appointments_used, chats_used, unique_chat_partners)
SELECT 
  '4500ad70-821f-44ea-85c5-d83140e98c6d',
  EXTRACT(MONTH FROM NOW()),
  EXTRACT(YEAR FROM NOW()),
  1024,
  0,
  0,
  '{}'
WHERE NOT EXISTS (
  SELECT 1 FROM provider_usage 
  WHERE provider_id = '4500ad70-821f-44ea-85c5-d83140e98c6d'
    AND month = EXTRACT(MONTH FROM NOW())
    AND year = EXTRACT(YEAR FROM NOW())
);
