using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using VisitTracker.Api.Data;
using VisitTracker.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<VisitTrackerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("VisitTracker")));

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<IVisitService, VisitService>();

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
