using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace TodoApi;

public class TodoDbContext(DbContextOptions<TodoDbContext> options) : IdentityDbContext<TodoUser, IdentityRole, string>(options)
{
    public DbSet<Todo> Todos => Set<Todo>();
    public DbSet<Leave> Leaves => Set<Leave>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<Todo>()
               .HasOne<TodoUser>()
               .WithMany()
               .HasForeignKey(t => t.OwnerId)
               .HasPrincipalKey(u => u.Id);

        builder.Entity<TodoUser>(b =>
        {
            b.OwnsOne(e => e.LeaveBalances, lb =>
            {
                lb.Property(l => l.AnnualLeavesBalance).HasColumnType("decimal(5, 1)").HasDefaultValue(0.0m); // Example: 5 total digits, 1 decimal place
                lb.Property(l => l.SickLeavesBalance).HasColumnType("decimal(5, 1)").HasDefaultValue(0.0m);
                lb.Property(l => l.SpecialLeavesBalance).HasColumnType("decimal(5, 1)").HasDefaultValue(0.0m);
            });
        });

        builder.Entity<Leave>()
               .HasOne<TodoUser>()
               .WithMany()
               .HasForeignKey(l => l.OwnerId)
               .HasPrincipalKey(u => u.Id);

        base.OnModelCreating(builder);
    }
}
