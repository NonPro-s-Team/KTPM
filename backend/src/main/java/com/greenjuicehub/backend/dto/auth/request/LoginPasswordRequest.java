package com.greenjuicehub.backend.dto.auth.request;

import com.greenjuicehub.backend.validation.BcryptPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LoginPasswordRequest {

    @NotBlank(message = "Vui lòng nhập số điện thoại, email hoặc tên đăng nhập")
    @Size(max = 100, message = "Thông tin đăng nhập không được vượt quá 100 ký tự")
    private String identifier;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    @BcryptPassword
    private String password;

    @Size(max = 4096, message = "Captcha token không hợp lệ")
    private String captchaToken;
}
