-- Drop the restrictive unique constraints that prevent duplicate job postings
-- These constraints are too strict and prevent legitimate duplicate job postings
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS unique_job_entry;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS unique_job_posting;