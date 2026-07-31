import {
  BedDouble,
  Building2,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  UsersRound,
} from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { ManagementSummary } from "../../components/management/ManagementSummary";
import {
  Alert,
  Button,
  DataTable,
  DropdownMenu,
  PageHeader,
  type DataTableColumn,
} from "../../components/ui";
import { properties } from "../../data/mockData";
import type { Property } from "../../types/models";
import "../../styles/management.css";

export function PropertiesPage() {
  const [message, setMessage] = useState("");
  const totalRooms = properties.reduce(
    (total, property) => total + property.roomCount,
    0,
  );
  const occupiedRooms = properties.reduce(
    (total, property) => total + property.occupiedCount,
    0,
  );

  const columns = useMemo<DataTableColumn<Property>[]>(
    () => [
      {
        id: "name",
        header: "Khu trọ",
        sortValue: (property) => property.name,
        cell: (property) => (
          <span className="primary-cell">
            <strong>{property.name}</strong>
            <small>{property.code}</small>
          </span>
        ),
      },
      {
        id: "address",
        header: "Địa chỉ",
        sortValue: (property) => property.address,
        cell: (property) => (
          <span className="inline-detail">
            <MapPin size={15} aria-hidden="true" />
            {property.address}
          </span>
        ),
      },
      {
        id: "occupancy",
        header: "Lấp đầy",
        sortValue: (property) => property.occupiedCount / property.roomCount,
        cell: (property) => {
          const occupancy = Math.round(
            (property.occupiedCount / property.roomCount) * 100,
          );
          return (
            <span className="occupancy-cell">
              <span>
                <strong>{occupancy}%</strong>
                <small>
                  {property.occupiedCount}/{property.roomCount} phòng
                </small>
              </span>
              <i
                className="occupancy-meter"
                style={{ "--occupancy": `${occupancy}%` } as CSSProperties}
                aria-hidden="true"
              />
            </span>
          );
        },
      },
      {
        id: "manager",
        header: "Phụ trách",
        sortValue: (property) => property.managerName,
        cell: (property) => property.managerName,
      },
      {
        id: "actions",
        header: "Thao tác",
        align: "end",
        width: "5rem",
        cell: (property) => (
          <div className="row-actions">
            <DropdownMenu
              label={`Thao tác cho ${property.name}`}
              trigger={<MoreHorizontal size={18} aria-hidden="true" />}
              items={[
                {
                  label: "Xem danh sách phòng",
                  icon: BedDouble,
                  onSelect: () =>
                    setMessage(`Đang mở danh sách phòng của ${property.name}.`),
                },
                {
                  label: "Chỉnh sửa khu trọ",
                  icon: Pencil,
                  onSelect: () =>
                    setMessage(`Đã chọn chỉnh sửa ${property.name}.`),
                },
              ]}
            />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="management-page">
      <PageHeader
        title="Quản lý khu trọ"
        description="Theo dõi quy mô, tỷ lệ lấp đầy và người phụ trách tại từng địa điểm."
        actions={
          <Button
            leadingIcon={Plus}
            onClick={() =>
              setMessage(
                "Luồng thêm khu trọ sẽ được kết nối sau khi hoàn thiện API địa điểm.",
              )
            }
          >
            Thêm khu trọ
          </Button>
        }
      />
      {message ? (
        <Alert title="Thông tin thao tác" tone="info">
          {message}
        </Alert>
      ) : null}
      <ManagementSummary
        items={[
          {
            label: "Tổng khu trọ",
            value: String(properties.length),
            meta: "Đang vận hành",
            icon: Building2,
          },
          {
            label: "Tổng số phòng",
            value: String(totalRooms),
            meta: "Trên toàn hệ thống",
            icon: BedDouble,
          },
          {
            label: "Đang thuê",
            value: String(occupiedRooms),
            meta: "Phòng có hợp đồng",
            icon: UsersRound,
          },
          {
            label: "Tỷ lệ lấp đầy",
            value: `${Math.round((occupiedRooms / totalRooms) * 100)}%`,
            meta: "Mức trung bình",
            icon: MapPin,
          },
        ]}
      />
      <DataTable
        rows={properties}
        columns={columns}
        getRowId={(property) => property.id}
        getSearchText={(property) =>
          `${property.name} ${property.code} ${property.address} ${property.managerName}`
        }
        searchPlaceholder="Tìm khu trọ, mã hoặc địa chỉ..."
        emptyTitle="Không tìm thấy khu trọ"
        emptyDescription="Thử đổi từ khóa tìm kiếm để xem kết quả khác."
      />
    </div>
  );
}
