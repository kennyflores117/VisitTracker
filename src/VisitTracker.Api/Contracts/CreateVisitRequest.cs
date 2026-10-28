using System.ComponentModel.DataAnnotations;

namespace VisitTracker.Api.Contracts;

// Id, ClockIn, ClockOut and Status are deliberately absent so clients can't set them.
public record CreateVisitRequest(
    [Required, StringLength(100)] string ClientName,
    [Required, StringLength(100)] string CaregiverName,
    // Nullable so a missing value fails [Required] instead of defaulting to 0001-01-01.
    [Required] DateTimeOffset? ScheduledStart);
