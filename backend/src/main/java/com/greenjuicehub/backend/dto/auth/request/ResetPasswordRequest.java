package com.greenjuicehub.backend.dto.auth.request;

import com.greenjuicehub.backend.validation.BcryptPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank(message = "Phiên xác thực không hợp lệ")
    @Size(max = 100, message = "Phiên xác thực không hợp lệ")
    private String tempToken;

    @NotBlank(message = "Vui lòng nhập mật khẩu mới")
    @BcryptPassword(minCharacters = 8)
    private String newPassword;
}
