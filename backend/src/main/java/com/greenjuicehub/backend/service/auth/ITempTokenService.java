package com.greenjuicehub.backend.service.auth;

public interface ITempTokenService {
    enum Purpose {
        LOGIN,
        SET_PASSWORD,
        RESET_PASSWORD
    }

    String generate(Long userId, Purpose purpose);

    Long consume(String token, Purpose... expectedPurposes);
}
