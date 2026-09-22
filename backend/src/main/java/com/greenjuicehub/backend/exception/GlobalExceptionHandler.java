package com.greenjuicehub.backend.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadableBody(HttpMessageNotReadableException ex) {
        Throwable cause = ex.getCause();

        // Phân biệt rõ nguyên nhân: sai kiểu Enum vs sai kiểu số/khác,
        // thay vì trả 1 message chung chung cho mọi lỗi parse JSON.
        if (cause instanceof InvalidFormatException ife) {
            if (ife.getTargetType() != null && ife.getTargetType().isEnum()) {
                String fieldName = ife.getPath().isEmpty()
                        ? "trường không xác định"
                        : ife.getPath().get(ife.getPath().size() - 1).getFieldName();
                String invalidValue = String.valueOf(ife.getValue());
                String allowedValues = Arrays.toString(ife.getTargetType().getEnumConstants());
                return ResponseEntity.badRequest().body(errorBody(400,
                        String.format("Giá trị '%s' không hợp lệ cho trường '%s'. Giá trị cho phép: %s",
                                invalidValue, fieldName, allowedValues)));
            }
            return ResponseEntity.badRequest().body(errorBody(400,
                    "Dữ liệu JSON không hợp lệ. Các trường số nguyên (ví dụ quantity) không được nhận số thập phân."));
        }

        return ResponseEntity.badRequest().body(errorBody(400,
                "Dữ liệu JSON không hợp lệ hoặc không đọc được"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(403).body(errorBody(403, "Bạn không có quyền thực hiện thao tác này"));
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<Map<String, Object>> handleAppException(AppException ex) {
        return ResponseEntity.status(ex.getStatus()).body(errorBody(
                ex.getStatus().value(), ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .findFirst().orElse("Dữ liệu không hợp lệ");
        return ResponseEntity.badRequest().body(errorBody(400, message));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParams(MissingServletRequestParameterException ex) {
        String message = String.format("Thiếu tham số bắt buộc: '%s'", ex.getParameterName());
        return ResponseEntity.badRequest().body(errorBody(400, message));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = String.format("Tham số '%s' nhận giá trị không hợp lệ", ex.getName());
        return ResponseEntity.badRequest().body(errorBody(400, message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return ResponseEntity.internalServerError().body(errorBody(500, "Lỗi hệ thống"));
    }

    private Map<String, Object> errorBody(int status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", status);
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now().toString());
        return body;
    }
}