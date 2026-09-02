package com.greenjuicehub.backend.service.user;

import com.greenjuicehub.backend.dto.user.request.ChangePasswordRequest;
import com.greenjuicehub.backend.dto.user.request.UpdateProfileRequest;
import com.greenjuicehub.backend.dto.user.response.UserProfileResponse;
import com.greenjuicehub.backend.entity.User;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.mapper.UserMapper;
import com.greenjuicehub.backend.repository.UserRepository;
import com.greenjuicehub.backend.service.user.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserMapper userMapper;
    @InjectMocks private UserServiceImpl userService;

    @Test
    void getProfileWhenUserExistsReturnsMappedProfile() {
        User user = User.builder().id(1L).build();
        UserProfileResponse expected = UserProfileResponse.builder().id(1L).name("Nguyen Van A").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toProfileResponse(user)).thenReturn(expected);

        assertSame(expected, userService.getProfile(1L));
        verify(userMapper).toProfileResponse(user);
    }

    @Test
    void getProfileWhenUserDoesNotExistThrowsNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        AppException error = assertThrows(AppException.class, () -> userService.getProfile(99L));

        assertEquals(HttpStatus.NOT_FOUND, error.getStatus());
        verifyNoInteractions(userMapper);
    }

    @Test
    void updateProfileUpdatesNonBlankFieldsAndReturnsMappedProfile() {
        User user = User.builder().id(1L).email("old@mail.com").username("old").build();
        UpdateProfileRequest request = updateRequest("Nguyen Van A", "new@mail.com", "new_user", "avatar.png");
        UserProfileResponse expected = UserProfileResponse.builder().id(1L).email("new@mail.com").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toProfileResponse(user)).thenReturn(expected);

        assertSame(expected, userService.updateProfile(1L, request));
        assertAll(
                () -> assertEquals("Nguyen Van A", user.getName()),
                () -> assertEquals("new@mail.com", user.getEmail()),
                () -> assertEquals("new_user", user.getUsername()),
                () -> assertEquals("avatar.png", user.getAvatarUrl()));
        verify(userRepository).save(user);
    }

    @Test
    void updateProfileWhenEmailIsTakenThrowsConflict() {
        User user = User.builder().id(1L).build();
        UpdateProfileRequest request = updateRequest(null, "used@mail.com", null, null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmailAndIdNot("used@mail.com", 1L)).thenReturn(true);

        AppException error = assertThrows(AppException.class, () -> userService.updateProfile(1L, request));

        assertEquals(HttpStatus.CONFLICT, error.getStatus());
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateProfileWhenUsernameIsTakenThrowsConflict() {
        User user = User.builder().id(1L).build();
        UpdateProfileRequest request = updateRequest(null, null, "used_name", null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.existsByUsernameAndIdNot("used_name", 1L)).thenReturn(true);

        AppException error = assertThrows(AppException.class, () -> userService.updateProfile(1L, request));

        assertEquals(HttpStatus.CONFLICT, error.getStatus());
        verify(userRepository, never()).save(any());
    }

    @Test
    void changePasswordWhenConfirmationDoesNotMatchThrowsBadRequest() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(User.builder().id(1L).build()));
        ChangePasswordRequest request = passwordRequest("oldPassword", "newPassword", "different");

        AppException error = assertThrows(AppException.class, () -> userService.changePassword(1L, request));

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatus());
        verifyNoInteractions(passwordEncoder);
        verify(userRepository, never()).save(any());
    }

    @Test
    void changePasswordWhenCurrentPasswordIsWrongThrowsBadRequest() {
        User user = User.builder().id(1L).hasPassword(true).passwordHash("oldHash").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "oldHash")).thenReturn(false);

        AppException error = assertThrows(AppException.class,
                () -> userService.changePassword(1L, passwordRequest("wrong", "newPassword", "newPassword")));

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatus());
        verify(userRepository, never()).save(any());
    }

    @Test
    void changePasswordWhenValidUpdatesHash() {
        User user = User.builder().id(1L).hasPassword(true).passwordHash("oldHash").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPassword", "oldHash")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("newHash");

        userService.changePassword(1L, passwordRequest("oldPassword", "newPassword", "newPassword"));

        assertEquals("newHash", user.getPasswordHash());
        assertTrue(user.getHasPassword());
        verify(userRepository).save(user);
    }

    @Test
    void changePasswordForPasswordlessUserSetsFirstPasswordWithoutCheckingCurrentPassword() {
        User user = User.builder().id(1L).hasPassword(false).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPassword")).thenReturn("newHash");

        userService.changePassword(1L, passwordRequest(null, "newPassword", "newPassword"));

        assertEquals("newHash", user.getPasswordHash());
        assertTrue(user.getHasPassword());
        verify(passwordEncoder, never()).matches(any(), any());
        verify(userRepository).save(user);
    }

    private UpdateProfileRequest updateRequest(String name, String email, String username, String avatarUrl) {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName(name);
        request.setEmail(email);
        request.setUsername(username);
        request.setAvatarUrl(avatarUrl);
        return request;
    }

    private ChangePasswordRequest passwordRequest(String current, String password, String confirmation) {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword(current);
        request.setNewPassword(password);
        request.setConfirmPassword(confirmation);
        return request;
    }
}
