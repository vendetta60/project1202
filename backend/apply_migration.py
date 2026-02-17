#!/usr/bin/env python
"""
Direct SQL migration for audit columns
"""
from app.core.config import settings
from sqlalchemy import create_engine, text

# Create engine to connect to database
engine = create_engine(settings.database_url)

# SQL commands to add audit columns
sql_commands = [
    # Users table
    """
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Users' AND COLUMN_NAME='is_deleted')
    BEGIN
        ALTER TABLE Users ADD is_deleted BIT NOT NULL DEFAULT 0;
        ALTER TABLE Users ADD created_at DATETIME DEFAULT GETUTCDATE();
        ALTER TABLE Users ADD created_by INT;
        ALTER TABLE Users ADD created_by_name VARCHAR(100);
        ALTER TABLE Users ADD updated_at DATETIME;
        ALTER TABLE Users ADD updated_by INT;
        ALTER TABLE Users ADD updated_by_name VARCHAR(100);
        PRINT 'Added audit columns to Users table';
    END
    ELSE
        PRINT 'Audit columns already exist in Users table';
    """,
    
    # Appeals table
    """
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Appeals' AND COLUMN_NAME='is_deleted')
    BEGIN
        ALTER TABLE Appeals ADD is_deleted BIT NOT NULL DEFAULT 0;
        ALTER TABLE Appeals ADD created_at DATETIME DEFAULT GETUTCDATE();
        ALTER TABLE Appeals ADD created_by INT;
        ALTER TABLE Appeals ADD created_by_name VARCHAR(100);
        ALTER TABLE Appeals ADD updated_at DATETIME;
        ALTER TABLE Appeals ADD updated_by INT;
        ALTER TABLE Appeals ADD updated_by_name VARCHAR(100);
        PRINT 'Added audit columns to Appeals table';
    END
    ELSE
        PRINT 'Audit columns already exist in Appeals table';
    """,
    
    # Contacts table
    """
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Contacts' AND COLUMN_NAME='is_deleted')
    BEGIN
        ALTER TABLE Contacts ADD is_deleted BIT NOT NULL DEFAULT 0;
        ALTER TABLE Contacts ADD created_at DATETIME DEFAULT GETUTCDATE();
        ALTER TABLE Contacts ADD created_by INT;
        ALTER TABLE Contacts ADD created_by_name VARCHAR(100);
        ALTER TABLE Contacts ADD updated_at DATETIME;
        ALTER TABLE Contacts ADD updated_by INT;
        ALTER TABLE Contacts ADD updated_by_name VARCHAR(100);
        PRINT 'Added audit columns to Contacts table';
    END
    ELSE
        PRINT 'Audit columns already exist in Contacts table';
    """,
    
    # AuditLogs table
    """
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='AuditLogs')
    BEGIN
        CREATE TABLE AuditLogs (
            id INT PRIMARY KEY IDENTITY(1,1),
            entity_type VARCHAR(50) NOT NULL,
            entity_id INT NOT NULL,
            action VARCHAR(20) NOT NULL,
            description VARCHAR(500),
            old_values TEXT,
            new_values TEXT,
            created_by INT,
            created_by_name VARCHAR(100),
            created_at DATETIME NOT NULL DEFAULT GETUTCDATE(),
            ip_address VARCHAR(45),
            user_agent VARCHAR(500)
        );
        CREATE INDEX idx_auditlogs_entity ON AuditLogs(entity_type, entity_id);
        CREATE INDEX idx_auditlogs_action ON AuditLogs(action);
        CREATE INDEX idx_auditlogs_created_by ON AuditLogs(created_by);
        CREATE INDEX idx_auditlogs_created_at ON AuditLogs(created_at);
        PRINT 'Created AuditLogs table';
    END
    ELSE
        PRINT 'AuditLogs table already exists';
    """
]

try:
    with engine.connect() as conn:
        for i, cmd in enumerate(sql_commands, 1):
            print(f"Executing command {i}/{len(sql_commands)}...", end=" ")
            try:
                conn.execute(text(cmd))
                print("[OK]")
            except Exception as e:
                print(f"[WARN] {str(e)[:50]}")
        conn.commit()
        print("\n[SUCCESS] Database migration completed successfully!")
except Exception as e:
    print(f"[ERROR] Error: {e}")
    import traceback
    traceback.print_exc()
