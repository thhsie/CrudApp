using Microsoft.AspNetCore.HttpLogging;
using Microsoft.AspNetCore.Identity;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Configure data protection, setup the application discriminator
// so that the data protection keys can be shared between the BFF and this API
builder.Services.AddDataProtection(o => o.ApplicationDiscriminator = "TodoApp");

// Configure auth
builder.Services.AddAuthentication().AddBearerToken(IdentityConstants.BearerScheme);
builder.Services.AddAuthorizationBuilder().AddCurrentUserHandler();

// Configure identity
builder.Services.AddIdentityCore<TodoUser>()
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<TodoDbContext>()
                .AddApiEndpoints();

// Configure the database
var connectionString = builder.Configuration.GetConnectionString("Todos") ?? "Data Source=.db/Todos.db";
builder.Services.AddSqlite<TodoDbContext>(connectionString);

// State that represents the current user from the database *and* the request
builder.Services.AddCurrentUser();

// Configure Open API
builder.Services.AddOpenApi(options => options.AddBearerTokenAuthentication());

// Configure rate limiting
builder.Services.AddRateLimiting();

builder.Services.AddHttpLogging(o =>
{
    if (builder.Environment.IsDevelopment())
    {
        o.CombineLogs = true;
        o.LoggingFields = HttpLoggingFields.ResponseBody | HttpLoggingFields.ResponseHeaders;
    }
});

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
await using (var dbContext = scope.ServiceProvider.GetRequiredService<TodoDbContext>())
{
    // Ensure roles exist
    await dbContext.Database.EnsureCreatedAsync();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    if (!await roleManager.RoleExistsAsync("Admin"))
    {
        await roleManager.CreateAsync(new IdentityRole("Admin"));
    }
    if (!await roleManager.RoleExistsAsync("Standard"))
    {
        await roleManager.CreateAsync(new IdentityRole("Standard"));
    }
    // Add a default admin user
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<TodoUser>>();
    if (await userManager.FindByNameAsync("admin") is null)
    {
        var adminUser = builder.Configuration.GetSection("AdminUser");
        var adminUserName = "admin";
        var adminUserEmail = adminUser["Email"] ?? "admin@dev.com";
        var adminUserPassword = adminUser["Password"] ?? "Pass123$";

        var admin = new TodoUser { UserName = adminUserName, Email = adminUserEmail };
        await userManager.CreateAsync(admin, adminUserPassword);
        await userManager.AddToRoleAsync(admin, "Admin");
        await userManager.UpdateAsync(admin);
    }
}

app.UseHttpLogging();
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.MapScalarApiReference(options =>
    {
        options.Servers = [];
        options.Authentication = new() { PreferredSecurityScheme = IdentityConstants.BearerScheme };
    });
}

app.MapOpenApi();

app.MapDefaultEndpoints();

app.Map("/", () => Results.Redirect("/scalar/v1"));

// Configure the APIs
app.MapTodos();
app.MapUsers();
app.MapLeaves();

app.Run();
