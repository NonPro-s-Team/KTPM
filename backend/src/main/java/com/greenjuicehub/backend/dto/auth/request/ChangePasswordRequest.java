package com.greenjuicehub.backend.dto.auth.request;

import com.greenjuicehub.backend.validation.BcryptPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {

    @NotBlank(message = "Vui lòng nhập mật khẩu cũ")
    @BcryptPassword
    private String oldPassword;

    @NotBlank(message = "Vui lòng nhập mật khẩu mới")
    @BcryptPassword(minCharacters = 8)
    private String newPassword;
}
