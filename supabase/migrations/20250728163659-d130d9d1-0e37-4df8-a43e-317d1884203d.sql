-- Make user_id column nullable in documents table to allow anonymous uploads
ALTER TABLE public.documents ALTER COLUMN user_id DROP NOT NULL;