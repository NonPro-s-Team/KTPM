package com.greenjuicehub.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.ANNOTATION_TYPE;
import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = BcryptPasswordValidator.class)
@Target({FIELD, PARAMETER, ANNOTATION_TYPE})
@Retention(RUNTIME)
public @interface BcryptPassword {

    String message() default "Mật khẩu phải có ít nhất {minCharacters} ký tự và không vượt quá {maxBytes} byte UTF-8";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    int minCharacters() default 0;

    int maxBytes() default 72;
}
