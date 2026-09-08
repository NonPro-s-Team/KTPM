package com.greenjuicehub.backend.dto.auth.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class VerifyOtpRequest {

    @NotBlank
    @Pattern(regexp = "^0[35789]\\d{8}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @NotBlank
    @Pattern(regexp = "^\\d{6}$", message = "OTP phải gồm đúng 6 chữ số")
    private String otpCode;

    @NotBlank(message = "Type không được để trống")
    @Pattern(regexp = "REGISTER|LOGIN|RESET_PASSWORD", message = "Type không hợp lệ")
    private String type;
}
