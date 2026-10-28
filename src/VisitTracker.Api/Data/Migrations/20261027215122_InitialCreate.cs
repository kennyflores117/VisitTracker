using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisitTracker.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Visits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClientName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CaregiverName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ScheduledStart = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ClockIn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ClockOut = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Visits", x => x.Id)
                        .Annotation("SqlServer:Clustered", false);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Visits_ScheduledStart",
                table: "Visits",
                column: "ScheduledStart")
                .Annotation("SqlServer:Clustered", true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Visits");
        }
    }
}
