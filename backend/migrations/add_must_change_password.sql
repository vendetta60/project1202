-- İlk girişdə parol dəyişmə məcburiyyəti üçün.
-- Users cədvəli artıq varsa, bu sütunu əlavə edin (bir dəfə işlədin).

-- MSSQL:
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = N'must_change_password'
)
BEGIN
  ALTER TABLE dbo.Users ADD must_change_password BIT NOT NULL DEFAULT 0;
END
GO
