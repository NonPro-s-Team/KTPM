package com.greenjuicehub.backend.service.user.impl;

import com.greenjuicehub.backend.dto.user.request.ChangePasswordRequest;
import com.greenjuicehub.backend.dto.user.request.UpdateProfileRequest;
import com.greenjuicehub.backend.dto.user.response.UserProfileResponse;
import com.greenjuicehub.backend.entity.User;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.mapper.UserMapper;
import com.greenjuicehub.backend.repository.UserRepository;
import com.greenjuicehub.backend.service.auth.PasswordAttemptService;
import com.greenjuicehub.backend.service.user.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordAttemptService passwordAttemptService;
    private final UserMapper userMapper;


    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = findUserOrThrow(userId);
        return userMapper.toProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUserOrThrow(userId);

        // Kiểm tra email đã tồn tại chưa (nếu có thay đổi)
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            boolean emailTaken = userRepository.existsByEmailAndIdNot(request.getEmail(), userId);
            if (emailTaken) {
                throw new AppException(HttpStatus.CONFLICT, "Email này đã được sử dụng bởi tài khoản khác");
            }
            user.setEmail(request.getEmail());
        }

        // Kiểm tra username đã tồn tại chưa (nếu có thay đổi)
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            boolean usernameTaken = userRepository.existsByUsernameAndIdNot(request.getUsername(), userId);
            if (usernameTaken) {
                throw new AppException(HttpStatus.CONFLICT, "Username này đã được sử dụng bởi tài khoản khác");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        userRepository.save(user);
        return userMapper.toProfileResponse(user);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findUserOrThrow(userId);

        // Validate confirm password
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không khớp");
        }

        // Nếu user đã có password → yêu cầu nhập đúng mật khẩu cũ
        if (Boolean.TRUE.equals(user.getHasPassword())) {
            String attemptKey = "change:" + userId;
            if (passwordAttemptService.isLocked(attemptKey)) {
                throw new AppException(HttpStatus.TOO_MANY_REQUESTS,
                        "Thao tác đổi mật khẩu tạm khóa, vui lòng thử lại sau");
            }
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()
                    || user.getPasswordHash() == null
                    || !passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                PasswordAttemptService.AttemptResult result = passwordAttemptService.recordFailed(attemptKey);
                if (result.isLocked()) {
                    throw new AppException(HttpStatus.TOO_MANY_REQUESTS,
                            "Thao tác đổi mật khẩu tạm khóa, vui lòng thử lại sau");
                }
                throw new AppException(HttpStatus.UNAUTHORIZED, "Mật khẩu hiện tại không đúng");
            }
            passwordAttemptService.clearAttempts(attemptKey);
            if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
                throw new AppException(HttpStatus.BAD_REQUEST,
                        "Mật khẩu mới không được trùng mật khẩu hiện tại");
            }
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setHasPassword(true);
        userRepository.save(user);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
    }

}
