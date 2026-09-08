package com.greenjuicehub.backend.dto.address.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateAddressRequest {

    @NotBlank(message = "Họ tên người nhận không được để trống")
    @Size(max = 100, message = "Họ tên không được vượt quá 100 ký tự")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{8,10}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    @Size(max = 100, message = "Tên tỉnh không được vượt quá 100 ký tự")
    private String province;

    @NotBlank(message = "Quận/Huyện không được để trống")
    @Size(max = 100, message = "Tên quận/huyện không được vượt quá 100 ký tự")
    private String district;

    @NotBlank(message = "Phường/Xã không được để trống")
    @Size(max = 100, message = "Tên phường/xã không được vượt quá 100 ký tự")
    private String ward;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    @Size(max = 500, message = "Địa chỉ chi tiết không được vượt quá 500 ký tự")
    private String detail;

    private Boolean isDefault = false;
    // GHN location IDs
    @Positive(message = "Mã quận/huyện phải là số dương")
    private Integer districtId;

    @Size(max = 10, message = "Mã phường/xã không được vượt quá 10 ký tự")
    @Pattern(regexp = "^[A-Za-z0-9_-]*$", message = "Mã phường/xã không hợp lệ")
    private String wardCode;
}
