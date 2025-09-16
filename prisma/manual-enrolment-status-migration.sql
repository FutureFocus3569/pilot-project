-- Add enrolment status fields to occupancy_data table
ALTER TABLE occupancy_data
  ADD COLUMN currentChildren INTEGER DEFAULT 0,
  ADD COLUMN futureChildren INTEGER DEFAULT 0,
  ADD COLUMN waitingChildren INTEGER DEFAULT 0,
  ADD COLUMN enquiryChildren INTEGER DEFAULT 0;
