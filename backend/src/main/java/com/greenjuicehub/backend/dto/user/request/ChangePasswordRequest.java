package com.greenjuicehub.backend.dto.user.request;

import com.greenjuicehub.backend.validation.BcryptPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {

    @BcryptPassword
    private String currentPassword;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @BcryptPassword(minCharacters = 8)
    private String newPassword;

    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    @BcryptPassword(minCharacters = 8)
    private String confirmPassword;
}
