package com.greenjuicehub.backend.dto.auth.request;

import com.greenjuicehub.backend.validation.BcryptPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SetPasswordRequest {

    @NotBlank
    @Size(max = 100, message = "Phiên xác thực không hợp lệ")
    private String tempToken;

    @NotBlank
    @BcryptPassword(minCharacters = 8)
    private String password;
}
