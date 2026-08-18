using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TroConnect.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTotalRoomsToBuilding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TotalRooms",
                table: "Buildings",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalRooms",
                table: "Buildings");
        }
    }
}
