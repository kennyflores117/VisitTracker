using Microsoft.AspNetCore.Mvc;
using VisitTracker.Api.Contracts;
using VisitTracker.Api.Controllers;
using VisitTracker.Api.Services;

namespace VisitTracker.Tests;

public sealed class VisitsControllerTests : IDisposable
{
    private readonly TestDatabase _database = new();

    public void Dispose() => _database.Dispose();

    [Fact]
    public async Task Create_CopiesRequestIntoVisitAndReturnsCreated()
    {
        var scheduledStart = new DateTimeOffset(2026, 11, 2, 9, 30, 0, TimeSpan.FromHours(-5));
        var request = new CreateVisitRequest("Ana Lopez", "Bob Smith", scheduledStart);

        await using var context = _database.CreateContext();
        var controller = new VisitsController(new VisitService(context, TimeProvider.System));

        var result = await controller.Create(request, CancellationToken.None);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(nameof(VisitsController.GetById), created.ActionName);

        var body = Assert.IsType<VisitResponse>(created.Value);
        Assert.Equal("Ana Lopez", body.ClientName);
        Assert.Equal("Bob Smith", body.CaregiverName);
        Assert.Equal(scheduledStart, body.ScheduledStart);
        Assert.Equal(body.Id, created.RouteValues!["id"]);
    }
}
