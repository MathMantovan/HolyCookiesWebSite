var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                      ?? ["https://localhost:7000", "http://localhost:5000"];
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();


app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.UseAuthorization();
app.MapControllers();

app.Run();
