-- ============================================
-- ADD ACTIVITY TYPES TO ACTIVITY LOGS
-- ============================================

-- Add activity_type column to activity_logs table
ALTER TABLE activity_logs 
ADD COLUMN IF NOT EXISTS activity_type VARCHAR(20) DEFAULT 'general';

-- Update existing records to have a default activity type
UPDATE activity_logs 
SET activity_type = 'general' 
WHERE activity_type IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_type 
ON activity_logs(activity_type);

-- ============================================
-- DONE! 🎉
-- ============================================
-- Now activity_logs table supports different activity types
-- Default value is 'general' for existing records
