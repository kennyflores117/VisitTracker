-- Index and execution plan practice. Loads a large table so a scan and a seek are
-- visibly different; the 16-row practice tables are too small for SQL Server to care.
--
-- BigVisits is separate from Clients/Caregivers/Visits and has no foreign keys, so it
-- can't affect the joins practice. The only index to start with is the clustered one
-- that the primary key creates. Safe to re-run: it drops and reloads BigVisits, which
-- also removes any index you added while experimenting.
--
-- Run it with:  sqlcmd -S "localhost\SQLEXPRESS" -E -C -b -i sql/practice/02-indexes.sql

USE SqlPractice;
GO

DROP TABLE IF EXISTS BigVisits;
GO

CREATE TABLE BigVisits (
    VisitId        INT IDENTITY(1, 1) CONSTRAINT PK_BigVisits PRIMARY KEY,  -- clustered
    ClientId       INT          NOT NULL,
    CaregiverId    INT          NOT NULL,
    ScheduledStart DATETIME2    NOT NULL,
    Status         NVARCHAR(20) NOT NULL,
    Notes          CHAR(100)    NOT NULL  -- filler so each row has a realistic size
);
GO

-- 200,000 visits spread over 5,000 clients and 199 caregivers across 2026. The values come
-- from arithmetic on the row number, not NEWID(), so every run loads identical data (and
-- CHOOSE would re-evaluate a NEWID() per branch and sometimes return NULL). The primes
-- keep the columns from lining up, so a client does not end up with a single status.
WITH Numbers AS (
    SELECT TOP (200000) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.all_objects a CROSS JOIN sys.all_objects b
)
INSERT INTO BigVisits (ClientId, CaregiverId, ScheduledStart, Status, Notes)
SELECT (n * 7919) % 5000 + 1,
       (n * 31) % 199 + 1,
       DATEADD(MINUTE, (n * 7727) % 525600, '2026-01-01'),
       CHOOSE((n * 17 % 101) % 4 + 1, 'Scheduled', 'InProgress', 'Completed', 'Missed'),
       'visit notes'
FROM Numbers;
GO

SELECT COUNT(*) AS TotalRows, COUNT(DISTINCT ClientId) AS DistinctClients FROM BigVisits;
GO
