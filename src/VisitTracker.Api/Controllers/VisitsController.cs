using Microsoft.AspNetCore.Mvc;
using VisitTracker.Api.Contracts;
using VisitTracker.Api.Models;
using VisitTracker.Api.Services;

namespace VisitTracker.Api.Controllers;

[ApiController]
[Route("api/visits")]
public class VisitsController(IVisitService visitService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VisitResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var visits = await visitService.GetAllAsync(cancellationToken);
        return Ok(visits.Select(VisitResponse.From));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<VisitResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var visit = await visitService.GetByIdAsync(id, cancellationToken);
        return visit is null ? NotFound() : Ok(VisitResponse.From(visit));
    }

    [HttpGet("missing-clock-in")]
    public async Task<ActionResult<IEnumerable<VisitResponse>>> GetMissingClockIn(CancellationToken cancellationToken)
    {
        var visits = await visitService.GetMissingClockInAsync(cancellationToken);
        return Ok(visits.Select(VisitResponse.From));
    }

    [HttpPost]
    public async Task<ActionResult<VisitResponse>> Create(CreateVisitRequest request, CancellationToken cancellationToken)
    {
        var visit = new Visit
        {
            ClientName = request.ClientName,
            CaregiverName = request.CaregiverName,
            ScheduledStart = request.ScheduledStart!.Value
        };

        var created = await visitService.AddAsync(visit, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, VisitResponse.From(created));
    }
}
