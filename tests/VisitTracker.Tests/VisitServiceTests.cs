using Microsoft.Extensions.Time.Testing;
using VisitTracker.Api.Models;
using VisitTracker.Api.Services;

namespace VisitTracker.Tests;

public sealed class VisitServiceTests : IDisposable
{
    private static readonly DateTimeOffset Now = new(2026, 10, 28, 12, 0, 0, TimeSpan.Zero);

    private readonly TestDatabase _database = new();
    private readonly FakeTimeProvider _timeProvider = new(Now);

    public void Dispose() => _database.Dispose();

    [Fact]
    public async Task AddAsync_SavesVisit()
    {
        var visit = NewVisit("Ana Lopez", Now.AddHours(2));

        await using (var context = _database.CreateContext())
        {
            await new VisitService(context, _timeProvider).AddAsync(visit);
        }

        // A fresh context proves the visit came from the database, not EF's change tracker.
        await using var verifyContext = _database.CreateContext();
        var saved = await verifyContext.Visits.FindAsync(visit.Id);

        Assert.NotNull(saved);
        Assert.Equal("Ana Lopez", saved.ClientName);
        Assert.Equal(VisitStatus.Scheduled, saved.Status);
    }

    [Fact]
    public async Task GetMissingClockInAsync_ReturnsOnlyPastVisitsWithoutClockIn()
    {
        var missed = NewVisit("Missed", Now.AddHours(-2));
        var clockedIn = NewVisit("Clocked in", Now.AddHours(-1));
        clockedIn.ClockIn = Now.AddHours(-1);
        var upcoming = NewVisit("Upcoming", Now.AddHours(1));
        await SeedAsync(missed, clockedIn, upcoming);

        await using var context = _database.CreateContext();
        var result = await new VisitService(context, _timeProvider).GetMissingClockInAsync();

        var visit = Assert.Single(result);
        Assert.Equal(missed.Id, visit.Id);
    }

    [Theory]
    [InlineData(-60, true)]
    [InlineData(0, true)]
    [InlineData(1, false)]
    public async Task GetMissingClockInAsync_IncludesVisitsScheduledUpToNow(int minutesFromNow, bool expectedMissing)
    {
        var visit = NewVisit("Boundary", Now.AddMinutes(minutesFromNow));
        await SeedAsync(visit);

        await using var context = _database.CreateContext();
        var result = await new VisitService(context, _timeProvider).GetMissingClockInAsync();

        Assert.Equal(expectedMissing, result.Any(v => v.Id == visit.Id));
    }

    [Fact]
    public async Task GetMissingClockInAsync_UsesCurrentTime()
    {
        var visit = NewVisit("Later today", Now.AddHours(3));
        await SeedAsync(visit);

        await using var context = _database.CreateContext();
        var service = new VisitService(context, _timeProvider);

        Assert.Empty(await service.GetMissingClockInAsync());

        _timeProvider.Advance(TimeSpan.FromHours(4));

        Assert.Single(await service.GetMissingClockInAsync());
    }

    private async Task SeedAsync(params Visit[] visits)
    {
        await using var context = _database.CreateContext();
        context.Visits.AddRange(visits);
        await context.SaveChangesAsync();
    }

    private static Visit NewVisit(string clientName, DateTimeOffset scheduledStart) => new()
    {
        ClientName = clientName,
        CaregiverName = "Bob Smith",
        ScheduledStart = scheduledStart
    };
}
