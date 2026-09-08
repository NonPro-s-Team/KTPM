package com.greenjuicehub.backend.config.properties;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Component
@Validated
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    @NotBlank(message = "JWT_SECRET must be configured")
    @Size(min = 32, message = "JWT_SECRET must contain at least 32 characters")
    private String secret;

    @Positive
    private long accessTokenExpiration;

    @Positive
    private long refreshTokenExpiration;
}
