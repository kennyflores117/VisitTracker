using VisitTracker.Api.Models;

namespace VisitTracker.Api.Contracts;

public record VisitResponse(
    Guid Id,
    string ClientName,
    string CaregiverName,
    DateTimeOffset ScheduledStart,
    DateTimeOffset? ClockIn,
    DateTimeOffset? ClockOut,
    VisitStatus Status)
{
    public static VisitResponse From(Visit visit) => new(
        visit.Id,
        visit.ClientName,
        visit.CaregiverName,
        visit.ScheduledStart,
        visit.ClockIn,
        visit.ClockOut,
        visit.Status);
}
