package com.greenjuicehub.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.nio.charset.StandardCharsets;

public class BcryptPasswordValidator implements ConstraintValidator<BcryptPassword, String> {

    private int minCharacters;
    private int maxBytes;

    @Override
    public void initialize(BcryptPassword constraint) {
        minCharacters = constraint.minCharacters();
        maxBytes = constraint.maxBytes();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        return value.length() >= minCharacters
                && value.getBytes(StandardCharsets.UTF_8).length <= maxBytes;
    }
}
