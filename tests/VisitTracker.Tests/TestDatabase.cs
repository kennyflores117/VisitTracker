using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using VisitTracker.Api.Data;

namespace VisitTracker.Tests;

// An in-memory SQLite database that lives as long as this object.
public sealed class TestDatabase : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly DbContextOptions<VisitTrackerDbContext> _options;

    public TestDatabase()
    {
        // The in-memory database is deleted when its last connection closes, so keep one open.
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        _options = new DbContextOptionsBuilder<VisitTrackerDbContext>()
            .UseSqlite(_connection)
            .Options;

        using var context = CreateContext();
        context.Database.EnsureCreated();
    }

    public VisitTrackerDbContext CreateContext() => new SqliteVisitTrackerDbContext(_options);

    public void Dispose() => _connection.Dispose();

    // SQLite has no DateTimeOffset type and can't compare or sort it, so store it as an
    // order-preserving long. SQL Server needs none of this.
    private sealed class SqliteVisitTrackerDbContext(DbContextOptions<VisitTrackerDbContext> options)
        : VisitTrackerDbContext(options)
    {
        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            configurationBuilder.Properties<DateTimeOffset>().HaveConversion<DateTimeOffsetToBinaryConverter>();
        }
    }
}
