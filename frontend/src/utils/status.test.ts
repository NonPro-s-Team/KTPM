import { describe, expect, it } from "vitest";
import { invoiceStatusMap, isContractExpiringSoon, maintenanceStatusMap, roomStatusMap, userRoleMap } from "./status";

describe("backend enum mapping", () => {
  it("ánh xạ đúng các giá trị enum camelCase quan trọng", () => {
    expect(roomStatusMap.available.label).toBe("Phòng trống");
    expect(invoiceStatusMap.partiallyPaid.label).toBe("Thanh toán một phần");
    expect(maintenanceStatusMap.inProgress.label).toBe("Đang xử lý");
    expect(userRoleMap.tenant.label).toBe("Khách thuê");
  });

  it("chỉ suy ra sắp hết hạn cho hợp đồng active trong 30 ngày", () => {
    const now = new Date("2026-07-31T00:00:00Z");
    expect(isContractExpiringSoon("active", "2026-08-15", now)).toBe(true);
    expect(isContractExpiringSoon("draft", "2026-08-15", now)).toBe(false);
    expect(isContractExpiringSoon("active", "2026-10-01", now)).toBe(false);
  });
});
