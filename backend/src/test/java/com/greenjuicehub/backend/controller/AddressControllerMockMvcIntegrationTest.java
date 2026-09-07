package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.address.request.CreateAddressRequest;
import com.greenjuicehub.backend.dto.address.request.UpdateAddressRequest;
import com.greenjuicehub.backend.dto.address.response.AddressResponse;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.user.IAddressService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AddressController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class AddressControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private IAddressService addressService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    void getAddressesReturnsAuthenticatedUsersAddresses() throws Exception {
        when(addressService.getAddresses(42L)).thenReturn(List.of(address(10L, true), address(11L, false)));

        mockMvc.perform(get("/api/users/me/addresses").with(customer(42L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].isDefault").value(true))
                .andExpect(jsonPath("$[1].id").value(11));

        verify(addressService).getAddresses(42L);
    }

    @Test
    void getAddressForwardsAuthenticatedUserAndPathId() throws Exception {
        when(addressService.getAddress(42L, 10L)).thenReturn(address(10L, true));

        mockMvc.perform(get("/api/users/me/addresses/10").with(customer(42L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.fullAddress").value(
                        "123 Nguyen Hue, Ben Nghe, Quan 1, TP. Ho Chi Minh"));

        verify(addressService).getAddress(42L, 10L);
    }

    @Test
    void createValidAddressReturnsCreated() throws Exception {
        when(addressService.createAddress(eq(42L), any(CreateAddressRequest.class)))
                .thenReturn(address(10L, true));

        mockMvc.perform(post("/api/users/me/addresses")
                        .with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validAddressJson(true)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.isDefault").value(true));

        verify(addressService).createAddress(eq(42L), argThat(request ->
                "0901234567".equals(request.getPhone()) && Boolean.TRUE.equals(request.getIsDefault())));
    }

    @Test
    void createAddressWithInvalidPhoneIsRejectedBeforeServiceCall() throws Exception {
        mockMvc.perform(post("/api/users/me/addresses")
                        .with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validAddressJson(false).replace("0901234567", "abc")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verifyNoInteractions(addressService);
    }

    @Test
    void updateAddressReturnsUpdatedAddress() throws Exception {
        when(addressService.updateAddress(eq(42L), eq(10L), any(UpdateAddressRequest.class)))
                .thenReturn(address(10L, false));

        mockMvc.perform(put("/api/users/me/addresses/10")
                        .with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validAddressJson(false)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10));

        verify(addressService).updateAddress(eq(42L), eq(10L), argThat(request ->
                "Nguyen Van A".equals(request.getFullName())));
    }

    @Test
    void deleteAddressReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/users/me/addresses/10").with(customer(42L)))
                .andExpect(status().isNoContent());

        verify(addressService).deleteAddress(42L, 10L);
    }

    @Test
    void setDefaultReturnsSelectedAddress() throws Exception {
        when(addressService.setDefault(42L, 10L)).thenReturn(address(10L, true));

        mockMvc.perform(patch("/api/users/me/addresses/10/default").with(customer(42L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.isDefault").value(true));

        verify(addressService).setDefault(42L, 10L);
    }

    @Test
    void anonymousUserCannotAccessAddresses() throws Exception {
        mockMvc.perform(get("/api/users/me/addresses"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(addressService);
    }

    private AddressResponse address(Long id, boolean isDefault) {
        return AddressResponse.builder().id(id).fullName("Nguyen Van A").phone("0901234567")
                .province("TP. Ho Chi Minh").district("Quan 1").ward("Ben Nghe")
                .detail("123 Nguyen Hue").isDefault(isDefault).build();
    }

    private String validAddressJson(boolean isDefault) {
        return """
                {
                  "fullName":"Nguyen Van A",
                  "phone":"0901234567",
                  "province":"TP. Ho Chi Minh",
                  "district":"Quan 1",
                  "ward":"Ben Nghe",
                  "detail":"123 Nguyen Hue",
                  "isDefault":%s
                }
                """.formatted(isDefault);
    }

    private RequestPostProcessor customer(Long userId) {
        return authentication(new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
    }
}
