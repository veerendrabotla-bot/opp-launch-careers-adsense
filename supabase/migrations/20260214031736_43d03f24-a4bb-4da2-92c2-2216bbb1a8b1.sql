
-- Add unique constraint on key column so upsert works correctly
ALTER TABLE public.platform_settings ADD CONSTRAINT platform_settings_key_unique UNIQUE (key);

-- Upsert real contact data
INSERT INTO public.platform_settings (key, value, updated_at) VALUES
  ('contact_email', '"hyperbuildlabs@gmail.com"'::jsonb, now()),
  ('contact_phone', '"+91-8328457378"'::jsonb, now()),
  ('contact_address', '"Rollno31 Edtech Private Limited"'::jsonb, now()),
  ('privacy_email', '"-"'::jsonb, now()),
  ('legal_email', '"-"'::jsonb, now()),
  ('business_hours', '"Mon-Fri: 9AM-6PM IST"'::jsonb, now())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
