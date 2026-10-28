using Microsoft.EntityFrameworkCore;
using VisitTracker.Api.Data;
using VisitTracker.Api.Models;

namespace VisitTracker.Api.Services;

public class VisitService(VisitTrackerDbContext db, TimeProvider timeProvider) : IVisitService
{
    public async Task<IReadOnlyList<Visit>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await db.Visits
            .AsNoTracking()
            .OrderBy(v => v.ScheduledStart)
            .ToListAsync(cancellationToken);
    }

    public async Task<Visit> AddAsync(Visit visit, CancellationToken cancellationToken = default)
    {
        db.Visits.Add(visit);
        await db.SaveChangesAsync(cancellationToken);
        return visit;
    }

    public async Task<IReadOnlyList<Visit>> GetMissingClockInAsync(CancellationToken cancellationToken = default)
    {
        var now = timeProvider.GetUtcNow();

        return await db.Visits
            .AsNoTracking()
            .Where(v => v.ClockIn == null && v.ScheduledStart <= now)
            .OrderBy(v => v.ScheduledStart)
            .ToListAsync(cancellationToken);
    }
}
