# Visit Tracker API

A small ASP.NET Core Web API for tracking caregiver visits: scheduling visits, listing them, and finding visits where the caregiver never clocked in.

Built with .NET 10, ASP.NET Core controllers, Entity Framework Core on SQL Server, and xUnit.

## Features

- List all visits, ordered by scheduled start
- Add a visit, with request validation
- Find visits that are past their scheduled start without a clock-in (a LINQ query translated to SQL)
- Look up a single visit by Id

## Tech stack

| Concern | Choice |
|---|---|
| Framework | ASP.NET Core 10 (controller-based Web API) |
| Data access | Entity Framework Core 10 with the SQL Server provider |
| Database | SQL Server (developed against SQL Server Express) |
| Migrations | EF Core migrations via the `dotnet-ef` local tool |
| Tests | xUnit, SQLite in-memory, `FakeTimeProvider` |

## Getting started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- SQL Server. The default connection string targets a local SQL Server Express instance named `SQLEXPRESS` using Windows Authentication.

### Run it

```bash
git clone https://github.com/kennyflores117/VisitTracker.git
cd VisitTracker

dotnet tool restore                                    # installs dotnet-ef
dotnet ef database update --project src/VisitTracker.Api
dotnet run --project src/VisitTracker.Api --launch-profile http
```

The API listens on `http://localhost:5212`. In Development, the OpenAPI document is at `http://localhost:5212/openapi/v1.json`.

### Using a different SQL Server

The connection string lives in `src/VisitTracker.Api/appsettings.json` under `ConnectionStrings:VisitTracker`. Override it without editing the file through an environment variable:

```bash
ConnectionStrings__VisitTracker="Server=...;Database=VisitTracker;..."
```

## API

| Method | Route | Description | Success |
|---|---|---|---|
| `GET` | `/api/visits` | All visits, ordered by scheduled start | `200 OK` |
| `GET` | `/api/visits/{id}` | A single visit | `200 OK`, or `404 Not Found` |
| `POST` | `/api/visits` | Create a visit | `201 Created` with a `Location` header |
| `GET` | `/api/visits/missing-clock-in` | Visits whose scheduled start has passed with no clock-in | `200 OK` |

### Create a visit

```http
POST /api/visits
Content-Type: application/json

{
  "clientName": "Ana Lopez",
  "caregiverName": "Bob Smith",
  "scheduledStart": "2026-10-28T09:00:00-05:00"
}
```

Response:

```json
{
  "id": "01a1814a-6050-76d3-9d99-02e7fcf41291",
  "clientName": "Ana Lopez",
  "caregiverName": "Bob Smith",
  "scheduledStart": "2026-10-28T09:00:00-05:00",
  "clockIn": null,
  "clockOut": null,
  "status": "Scheduled"
}
```

Invalid requests (for example a missing `clientName` or `scheduledStart`) return `400 Bad Request` with RFC 9110 problem details listing each field error. The server always assigns `id` and `status`; clients can't set them.

`src/VisitTracker.Api/VisitTracker.Api.http` contains ready-to-send requests for each endpoint.

## Design notes

- **Non-sequential Ids.** Visits use version 7 GUIDs (`Guid.CreateVersion7()`) instead of sequential integers, so Ids can't be guessed or enumerated. This is defense in depth, not a replacement for authorization.
- **Clustered index on `ScheduledStart`.** SQL Server doesn't sort GUIDs in v7 order, so the primary key is nonclustered and the table is clustered on the schedule instead, which also suits date-range queries.
- **Request and response DTOs.** The API never binds to the EF entity directly, which prevents over-posting and keeps the API shape independent of the database schema.
- **Injected clock.** "Missing clock-in" depends on the current time, so the service takes a `TimeProvider` rather than reading `DateTimeOffset.UtcNow`, which makes it testable.
- **Enums stored and serialized as strings.** `Status` is `"Scheduled"` in both the database and JSON, so reordering the enum can never change the meaning of existing data.

## Tests

```bash
dotnet test
```

The tests run the real `VisitService` against an in-memory SQLite database, so the LINQ queries are translated to SQL just as they are in production. A `FakeTimeProvider` freezes the clock to test the missing-clock-in boundaries. SQLite has no native `DateTimeOffset` type, so the test database stores those columns as sortable integers; production code is unaffected.

## Project structure

```
VisitTracker/
├── src/VisitTracker.Api/
│   ├── Contracts/      Request and response DTOs
│   ├── Controllers/    VisitsController
│   ├── Data/           DbContext and EF Core migrations
│   ├── Models/         Visit entity and VisitStatus enum
│   ├── Services/       IVisitService and VisitService
│   └── Program.cs      DI registration and HTTP pipeline
└── tests/VisitTracker.Tests/
    ├── TestDatabase.cs           In-memory SQLite setup
    ├── VisitServiceTests.cs
    └── VisitsControllerTests.cs
```
