package com.greenjuicehub.backend.dto.auth.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TempTokenRequest {

    @NotBlank(message = "Phiên xác thực không hợp lệ")
    @Size(max = 100, message = "Phiên xác thực không hợp lệ")
    private String tempToken;
}
