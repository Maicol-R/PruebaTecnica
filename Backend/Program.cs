using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Backend.Data;


var builder = WebApplication.CreateBuilder(args);

// política de CORS
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

// servicios del contenedor
builder.Services.AddControllers();

// configuracion Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// configuracion CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                      // para la ejecucion del frontend
                      policy.WithOrigins("http://localhost:5000", // para servidores locales
                                         "http://localhost:8080",
                                         "http://127.0.0.1:5500")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

// registro de ClienteRepository para inyección de Dependencias
builder.Services.AddScoped<IClienteRepository, ClienteRepository>();


var app = builder.Build();

// configuracion de canalización de solicitudes HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// habilita el CORS en el pipeline de solicitudes
app.UseCors(MyAllowSpecificOrigins);

app.UseAuthorization();

app.MapControllers();

app.Run();