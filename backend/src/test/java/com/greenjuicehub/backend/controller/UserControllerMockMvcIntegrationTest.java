package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.user.request.ChangePasswordRequest;
import com.greenjuicehub.backend.dto.user.request.UpdateProfileRequest;
import com.greenjuicehub.backend.dto.user.response.UserProfileResponse;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.user.IUserService;
import com.greenjuicehub.backend.utils.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class UserControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private IUserService userService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    void authenticatedUserGetsOwnProfile() throws Exception {
        when(userService.getProfile(42L)).thenReturn(UserProfileResponse.builder()
                .id(42L).name("Nguyen Van A").email("user@mail.com").build());

        mockMvc.perform(get("/api/users/me").with(customer(42L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.name").value("Nguyen Van A"))
                .andExpect(jsonPath("$.email").value("user@mail.com"));

        verify(userService).getProfile(42L);
    }

    @Test
    void anonymousUserCannotGetProfile() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(userService);
    }

    @Test
    void validProfileUpdateUsesAuthenticatedUserIdAndBody() throws Exception {
        when(userService.updateProfile(eq(42L), any(UpdateProfileRequest.class)))
                .thenReturn(UserProfileResponse.builder().id(42L).name("Nguyen Van B").username("nguyen.b").build());

        mockMvc.perform(put("/api/users/me")
                        .with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Nguyen Van B","email":"b@mail.com","username":"nguyen.b"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.username").value("nguyen.b"));

        verify(userService).updateProfile(eq(42L), argThat(request ->
                "Nguyen Van B".equals(request.getName()) && "b@mail.com".equals(request.getEmail())));
    }

    @Test
    void invalidEmailIsRejectedBeforeServiceCall() throws Exception {
        mockMvc.perform(put("/api/users/me")
                        .with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Nguyen Van A\",\"email\":\"not-an-email\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verifyNoInteractions(userService);
    }

    @Test
    void changePasswordReturnsNoContentAndUsesAuthenticatedUserId() throws Exception {
        mockMvc.perform(put("/api/users/me/password")
                        .with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword":"oldPassword","newPassword":"newPassword","confirmPassword":"newPassword"}
                                """))
                .andExpect(status().isNoContent());

        verify(userService).changePassword(eq(42L), argThat(request ->
                "oldPassword".equals(request.getCurrentPassword())
                        && "newPassword".equals(request.getNewPassword())));
    }

    @Test
    void shortNewPasswordIsRejectedBeforeServiceCall() throws Exception {
        mockMvc.perform(put("/api/users/me/password")
                        .with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"newPassword\":\"12345\",\"confirmPassword\":\"12345\"}"))
                .andExpect(status().isBadRequest());

        verify(userService, never()).changePassword(any(), any(ChangePasswordRequest.class));
    }

    private RequestPostProcessor customer(Long userId) {
        return authentication(new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
    }
}
