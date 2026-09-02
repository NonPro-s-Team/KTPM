package com.greenjuicehub.backend.service.contact.impl;

import com.greenjuicehub.backend.dto.contact.request.CreateContactRequest;
import com.greenjuicehub.backend.dto.contact.response.ContactResponse;
import com.greenjuicehub.backend.entity.Contact;
import com.greenjuicehub.backend.mapper.ContactMapper;
import com.greenjuicehub.backend.repository.ContactRepository;
import com.greenjuicehub.backend.service.email.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContactServiceImplTest {

    @Mock private ContactRepository contactRepository;
    @Mock private EmailService emailService;
    @Mock private ContactMapper contactMapper;

    @InjectMocks private ContactServiceImpl contactService;

    @Test
    void createContactSavesEntityAndSendsNotificationEmail() {
        CreateContactRequest request = new CreateContactRequest();
        request.setFullName("Nguyen Van A");
        request.setEmail("a@example.com");
        request.setPhone("0900000000");
        request.setSubject("Hỏi về đơn hàng");
        request.setMessage("Đơn hàng của tôi khi nào giao?");

        Contact saved = Contact.builder().id(1L).fullName("Nguyen Van A").build();
        ContactResponse expected = ContactResponse.builder().id(1L).fullName("Nguyen Van A").build();

        when(contactRepository.save(any(Contact.class))).thenReturn(saved);
        when(contactMapper.toResponse(saved)).thenReturn(expected);

        ContactResponse result = contactService.createContact(request);

        assertThat(result).isSameAs(expected);

        ArgumentCaptor<Contact> captor = ArgumentCaptor.forClass(Contact.class);
        verify(contactRepository).save(captor.capture());
        assertThat(captor.getValue().getFullName()).isEqualTo("Nguyen Van A");
        assertThat(captor.getValue().getEmail()).isEqualTo("a@example.com");
        assertThat(captor.getValue().getSubject()).isEqualTo("Hỏi về đơn hàng");
        assertThat(captor.getValue().getMessage()).isEqualTo("Đơn hàng của tôi khi nào giao?");

        verify(emailService).sendContactNotification(request);
    }
}