package com.greenjuicehub.backend.service.auth;

import com.greenjuicehub.backend.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class CaptchaVerifier {

    private final RestTemplate restTemplate;

    @Value("${google.recaptcha-secret}")
    private String recaptchaSecret;

    private static final String VERIFY_URL =
            "https://www.google.com/recaptcha/api/siteverify";

    public void verify(String captchaToken) {
        if (captchaToken == null || captchaToken.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Vui lòng xác minh captcha");
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("secret", recaptchaSecret);
        form.add("response", captchaToken);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);
        CaptchaResponse response = restTemplate.postForObject(
                VERIFY_URL, request, CaptchaResponse.class);

        if (response == null || !response.success()) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Xác minh captcha thất bại, vui lòng thử lại");
        }
    }

    private record CaptchaResponse(boolean success) {
    }
}
