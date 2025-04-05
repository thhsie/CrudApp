using Todo.Web.Server;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Configure auth with the front end
builder.AddAuthentication();
builder.Services.AddAuthorizationBuilder();

// Configure data protection, setup the application discriminator so that the data protection keys can be shared between the BFF and this API
builder.Services.AddDataProtection(o => o.ApplicationDiscriminator = "TodoApp");

builder.Services.AddAntiforgery();

// Add the forwarder to make sending requests to the backend easier
builder.Services.AddHttpForwarderWithServiceDiscovery();

// Configure the HttpClient for the backend API
builder.Services.AddHttpClient<AuthClient>(client =>
{
    client.BaseAddress = new("http://todoapi");
});

var app = builder.Build();

app.MapDefaultEndpoints();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseAntiforgery();

app.MapStaticAssets();

// Configure the APIs
app.MapAuth();
app.MapTodos();
app.MapLeaves();
app.MapRoles();

app.Run();
