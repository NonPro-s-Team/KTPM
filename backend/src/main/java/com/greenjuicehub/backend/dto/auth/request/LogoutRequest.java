package com.greenjuicehub.backend.dto.auth.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LogoutRequest {

    @NotBlank(message = "Refresh token không được để trống")
    @Size(max = 2048, message = "Refresh token không hợp lệ")
    private String refreshToken;
}
