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
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

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

    // 1. Xử lý lỗi thiếu @RequestParam (Lỗi làm bạn bị HTTP 500 ban đầu)
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParams(MissingServletRequestParameterException ex) {
        String message = String.format("Thiếu tham số bắt buộc: '%s'", ex.getParameterName());
        return ResponseEntity.badRequest().body(errorBody(400, message));
    }

    // 2. (Khuyên dùng) Xử lý lỗi truyền sai kiểu dữ liệu qua @RequestParam/@PathVariable
    //    (vd: productId="abc" trên query string, không áp dụng cho JSON body)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = String.format("Tham số '%s' nhận giá trị không hợp lệ", ex.getName());
        return ResponseEntity.badRequest().body(errorBody(400, message));
    }

    // 3. Xử lý lỗi parse JSON body: sai kiểu dữ liệu (vd: rating="abc" hoặc 3.5 vào field Byte),
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        String message = "Dữ liệu gửi lên không hợp lệ";

        // Cố gắng bóc tách tên field cụ thể nếu nguyên nhân là do sai kiểu dữ liệu
        // (Jackson InvalidFormatException), để trả message rõ ràng hơn cho FE/tester.
        Throwable cause = ex.getCause();
        if (cause instanceof InvalidFormatException ife && !ife.getPath().isEmpty()) {
            String fieldName = ife.getPath().get(ife.getPath().size() - 1).getFieldName();
            message = String.format("Trường '%s' nhận giá trị không hợp lệ", fieldName);
        }

        log.warn("HttpMessageNotReadableException: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(errorBody(400, message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);  // ← thêm dòng này
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