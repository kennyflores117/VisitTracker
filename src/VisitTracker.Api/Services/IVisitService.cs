using VisitTracker.Api.Models;

namespace VisitTracker.Api.Services;

public interface IVisitService
{
    Task<IReadOnlyList<Visit>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<Visit> AddAsync(Visit visit, CancellationToken cancellationToken = default);

    // Visits whose scheduled start has passed without a clock-in.
    Task<IReadOnlyList<Visit>> GetMissingClockInAsync(CancellationToken cancellationToken = default);
}
