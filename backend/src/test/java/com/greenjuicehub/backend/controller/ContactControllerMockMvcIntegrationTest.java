package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.contact.response.ContactResponse;
import com.greenjuicehub.backend.entity.Contact.ContactStatus;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.contact.IContactService;
import com.greenjuicehub.backend.utils.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ContactController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class ContactControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private IContactService contactService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    void anonymousUserCanSubmitContactForm() throws Exception {
        when(contactService.createContact(any())).thenReturn(ContactResponse.builder()
                .id(1L).fullName("Nguyen Van A").email("a@example.com")
                .subject("Hỏi về đơn hàng").status(ContactStatus.NEW).build());

        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Nguyen Van A",
                                  "email": "a@example.com",
                                  "phone": "0900000000",
                                  "subject": "Hỏi về đơn hàng",
                                  "message": "Đơn hàng của tôi khi nào giao?"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("NEW"));

        verify(contactService).createContact(argThat(request ->
                request.getFullName().equals("Nguyen Van A")
                        && request.getEmail().equals("a@example.com")
                        && request.getSubject().equals("Hỏi về đơn hàng")));
    }

    @Test
    void createContactRejectsInvalidEmailBeforeCallingService() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Nguyen Van A",
                                  "email": "not-an-email",
                                  "subject": "Hỏi về đơn hàng",
                                  "message": "Nội dung"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("email: Email không hợp lệ"));

        verify(contactService, never()).createContact(any());
    }

    @Test
    void createContactRejectsBlankRequiredFields() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "",
                                  "email": "a@example.com",
                                  "subject": "Hỏi",
                                  "message": "Nội dung"
                                }
                                """))
                .andExpect(status().isBadRequest());

        verify(contactService, never()).createContact(any());
    }
}