using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoApi.Migrations
{
    /// <inheritdoc />
    public partial class AddHalfDayLeaves : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsEndHalfDay",
                table: "Leaves",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsStartHalfDay",
                table: "Leaves",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<decimal>(
                name: "LeaveBalances_SpecialLeavesBalance",
                table: "AspNetUsers",
                type: "decimal(5, 1)",
                nullable: false,
                defaultValue: 0.0m,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<decimal>(
                name: "LeaveBalances_SickLeavesBalance",
                table: "AspNetUsers",
                type: "decimal(5, 1)",
                nullable: false,
                defaultValue: 0.0m,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<decimal>(
                name: "LeaveBalances_AnnualLeavesBalance",
                table: "AspNetUsers",
                type: "decimal(5, 1)",
                nullable: false,
                defaultValue: 0.0m,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsEndHalfDay",
                table: "Leaves");

            migrationBuilder.DropColumn(
                name: "IsStartHalfDay",
                table: "Leaves");

            migrationBuilder.AlterColumn<int>(
                name: "LeaveBalances_SpecialLeavesBalance",
                table: "AspNetUsers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(decimal),
                oldType: "decimal(5, 1)",
                oldDefaultValue: 0.0m);

            migrationBuilder.AlterColumn<int>(
                name: "LeaveBalances_SickLeavesBalance",
                table: "AspNetUsers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(decimal),
                oldType: "decimal(5, 1)",
                oldDefaultValue: 0.0m);

            migrationBuilder.AlterColumn<int>(
                name: "LeaveBalances_AnnualLeavesBalance",
                table: "AspNetUsers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(decimal),
                oldType: "decimal(5, 1)",
                oldDefaultValue: 0.0m);
        }
    }
}
