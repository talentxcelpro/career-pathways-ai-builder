-- Drop the restrictive unique constraints that prevent duplicate job postings
-- These constraints are too strict and prevent legitimate duplicate job postings
DROP INDEX IF EXISTS unique_job_entry;
DROP INDEX IF EXISTS unique_job_posting;