using Microsoft.EntityFrameworkCore;
using VisitTracker.Api.Models;

namespace VisitTracker.Api.Data;

public class VisitTrackerDbContext(DbContextOptions<VisitTrackerDbContext> options) : DbContext(options)
{
    public DbSet<Visit> Visits => Set<Visit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Visit>(visit =>
        {
            // The model assigns a version 7 GUID, so EF should never generate one.
            visit.HasKey(v => v.Id).IsClustered(false);
            visit.Property(v => v.Id).ValueGeneratedNever();

            // SQL Server doesn't sort GUIDs in v7 order, so cluster on the schedule instead.
            visit.HasIndex(v => v.ScheduledStart).IsClustered();

            visit.Property(v => v.ClientName).HasMaxLength(100);
            visit.Property(v => v.CaregiverName).HasMaxLength(100);

            visit.Property(v => v.Status)
                .HasConversion<string>()
                .HasMaxLength(20);
        });
    }
}
