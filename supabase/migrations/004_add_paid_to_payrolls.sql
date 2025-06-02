-- Add 'paid' column to payrolls table
ALTER TABLE payrolls ADD COLUMN paid boolean DEFAULT false; 