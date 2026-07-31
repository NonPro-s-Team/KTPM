import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DataTable, type DataTableColumn } from "./DataTable";

interface TestRow {
  id: string;
  code: string;
  status: string;
}

const rows: TestRow[] = [
  { id: "1", code: "A-101", status: "Đang thuê" },
  { id: "2", code: "B-202", status: "Phòng trống" },
];

const columns: DataTableColumn<TestRow>[] = [
  {
    id: "code",
    header: "Phòng",
    sortValue: (row) => row.code,
    cell: (row) => row.code,
  },
  {
    id: "status",
    header: "Trạng thái",
    cell: (row) => row.status,
  },
];

describe("DataTable", () => {
  it("lọc hàng theo từ khóa tìm kiếm", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        getSearchText={(row) => `${row.code} ${row.status}`}
        searchPlaceholder="Tìm phòng..."
      />,
    );

    await user.type(screen.getByPlaceholderText("Tìm phòng..."), "B-202");

    expect(screen.getByText("B-202")).toBeInTheDocument();
    expect(screen.queryByText("A-101")).not.toBeInTheDocument();
  });
});
