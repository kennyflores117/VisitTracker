namespace VisitTracker.Api.Models;

public class Visit
{
    // Version 7 GUID: random enough not to be guessable from another visit's Id.
    public Guid Id { get; init; } = Guid.CreateVersion7();

    public required string ClientName { get; set; }

    public required string CaregiverName { get; set; }

    public required DateTimeOffset ScheduledStart { get; set; }

    // Null until the caregiver clocks in / out.
    public DateTimeOffset? ClockIn { get; set; }

    public DateTimeOffset? ClockOut { get; set; }

    public VisitStatus Status { get; set; } = VisitStatus.Scheduled;
}
