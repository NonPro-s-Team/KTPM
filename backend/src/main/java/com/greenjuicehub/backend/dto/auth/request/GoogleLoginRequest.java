package com.greenjuicehub.backend.dto.auth.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class GoogleLoginRequest {

    @NotBlank
    @Size(max = 8192, message = "Google token không hợp lệ")
    private String idToken; // Token từ Google trả về FE
}
