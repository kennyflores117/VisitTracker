-- Practice database for SQL interview prep. Separate from the VisitTracker database
-- that EF Core manages, so nothing here touches the API's schema or migrations.
--
-- A normalized version of the visit model: clients and caregivers are their own tables,
-- and visits reference them with foreign keys. Safe to re-run: it rebuilds only the
-- practice tables and the sample data.
--
-- Run it with:  sqlcmd -S "localhost\SQLEXPRESS" -E -C -i sql/practice/01-setup.sql

IF DB_ID('SqlPractice') IS NULL
    CREATE DATABASE SqlPractice;
GO

USE SqlPractice;
GO

DROP TABLE IF EXISTS Visits;
DROP TABLE IF EXISTS Caregivers;
DROP TABLE IF EXISTS Clients;
GO

CREATE TABLE Clients (
    ClientId INT IDENTITY(1, 1) CONSTRAINT PK_Clients PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    City     NVARCHAR(50)  NOT NULL
);

CREATE TABLE Caregivers (
    CaregiverId INT IDENTITY(1, 1) CONSTRAINT PK_Caregivers PRIMARY KEY,
    FullName    NVARCHAR(100) NOT NULL,
    Role        NVARCHAR(20)  NOT NULL
        CONSTRAINT CK_Caregivers_Role CHECK (Role IN ('Nurse', 'SocialWorker', 'Aide'))
);

CREATE TABLE Visits (
    VisitId        INT IDENTITY(1, 1) CONSTRAINT PK_Visits PRIMARY KEY,
    ClientId       INT NOT NULL CONSTRAINT FK_Visits_Clients     REFERENCES Clients (ClientId),
    CaregiverId    INT NOT NULL CONSTRAINT FK_Visits_Caregivers  REFERENCES Caregivers (CaregiverId),
    ScheduledStart DATETIME2 NOT NULL,
    ClockIn        DATETIME2 NULL,
    ClockOut       DATETIME2 NULL,
    Status         NVARCHAR(20) NOT NULL
        CONSTRAINT CK_Visits_Status CHECK (Status IN ('Scheduled', 'InProgress', 'Completed', 'Missed'))
);
GO

-- Carl Jones has no visits, to show what LEFT JOIN keeps and INNER JOIN drops.
INSERT INTO Clients (FullName, City) VALUES
    ('Jane Doe',      'Columbus'),   -- 1
    ('Robert Lee',    'Columbus'),   -- 2
    ('Alice Brown',   'Dayton'),     -- 3
    ('Fay Wong',      'Dayton'),     -- 4
    ('Carl Jones',    'Cleveland'),  -- 5 (no visits)
    ('Silvia Flores', 'Columbus');   -- 6

-- Dee Park has no visits.
INSERT INTO Caregivers (FullName, Role) VALUES
    ('John Smith',   'Nurse'),         -- 1
    ('Maria Garcia', 'Aide'),          -- 2
    ('Dee Park',     'SocialWorker'),  -- 3 (no visits)
    ('Bob Smith',    'Aide'),          -- 4
    ('Ana Lopez',    'Nurse');         -- 5

-- Fixed dates (not GETDATE) so every query returns the same results every time.
-- Treat "today" as 2026-11-03. Visits 11 and 12 are in the past with no clock-in but are
-- still 'Scheduled', mirroring the real VisitTracker data, where nothing sets 'Missed' yet.
INSERT INTO Visits (ClientId, CaregiverId, ScheduledStart, ClockIn, ClockOut, Status) VALUES
    (1, 1, '2026-10-26 09:00', '2026-10-26 09:02', '2026-10-26 10:01', 'Completed'),  -- 1
    (1, 1, '2026-10-28 09:00', '2026-10-28 08:58', '2026-10-28 10:05', 'Completed'),  -- 2
    (1, 1, '2026-10-30 09:00', '2026-10-30 09:15', '2026-10-30 10:00', 'Completed'),  -- 3
    (2, 2, '2026-10-26 11:30', '2026-10-26 11:30', '2026-10-26 12:45', 'Completed'),  -- 4
    (2, 2, '2026-10-28 11:30', NULL,               NULL,               'Missed'),     -- 5
    (2, 4, '2026-10-30 11:30', '2026-10-30 11:41', '2026-10-30 12:30', 'Completed'),  -- 6
    (3, 5, '2026-10-27 14:00', '2026-10-27 14:00', '2026-10-27 15:30', 'Completed'),  -- 7
    (3, 5, '2026-10-29 14:00', '2026-10-29 14:05', '2026-10-29 15:10', 'Completed'),  -- 8
    (3, 1, '2026-11-01 14:00', NULL,               NULL,               'Missed'),     -- 9
    (4, 4, '2026-10-27 09:00', '2026-10-27 09:00', '2026-10-27 09:50', 'Completed'),  -- 10
    (4, 4, '2026-10-29 09:00', NULL,               NULL,               'Scheduled'),  -- 11
    (6, 2, '2026-10-28 20:00', NULL,               NULL,               'Scheduled'),  -- 12
    (6, 5, '2026-11-02 09:00', '2026-11-02 09:03', NULL,               'InProgress'), -- 13
    (1, 2, '2026-11-05 09:00', NULL,               NULL,               'Scheduled'),  -- 14
    (2, 1, '2026-11-05 13:00', NULL,               NULL,               'Scheduled'),  -- 15
    (6, 4, '2026-11-06 10:00', NULL,               NULL,               'Scheduled');  -- 16
GO

SELECT 'Clients' AS TableName, COUNT(*) AS Rows FROM Clients
UNION ALL SELECT 'Caregivers', COUNT(*) FROM Caregivers
UNION ALL SELECT 'Visits',     COUNT(*) FROM Visits;
GO
