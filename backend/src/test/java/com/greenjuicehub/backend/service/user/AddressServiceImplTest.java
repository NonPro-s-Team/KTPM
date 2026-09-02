package com.greenjuicehub.backend.service.user;

import com.greenjuicehub.backend.dto.address.request.CreateAddressRequest;
import com.greenjuicehub.backend.dto.address.request.UpdateAddressRequest;
import com.greenjuicehub.backend.dto.address.response.AddressResponse;
import com.greenjuicehub.backend.entity.Address;
import com.greenjuicehub.backend.entity.User;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.mapper.AddressMapper;
import com.greenjuicehub.backend.repository.AddressRepository;
import com.greenjuicehub.backend.repository.UserRepository;
import com.greenjuicehub.backend.service.user.impl.AddressServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AddressServiceImplTest {

    @Mock private AddressRepository addressRepository;
    @Mock private UserRepository userRepository;
    @Mock private AddressMapper addressMapper;
    @InjectMocks private AddressServiceImpl addressService;

    @Test
    void getAddressesMapsEveryOwnedAddressInRepositoryOrder() {
        Address first = Address.builder().id(1L).isDefault(true).build();
        Address second = Address.builder().id(2L).isDefault(false).build();
        AddressResponse firstResponse = response(1L, true);
        AddressResponse secondResponse = response(2L, false);
        when(addressRepository.findAllByUserIdOrdered(7L)).thenReturn(List.of(first, second));
        when(addressMapper.toResponse(first)).thenReturn(firstResponse);
        when(addressMapper.toResponse(second)).thenReturn(secondResponse);

        assertEquals(List.of(firstResponse, secondResponse), addressService.getAddresses(7L));
    }

    @Test
    void getAddressUsesBothAddressIdAndUserId() {
        Address address = Address.builder().id(9L).build();
        AddressResponse expected = response(9L, false);
        when(addressRepository.findByIdAndUserId(9L, 7L)).thenReturn(Optional.of(address));
        when(addressMapper.toResponse(address)).thenReturn(expected);

        assertSame(expected, addressService.getAddress(7L, 9L));
        verify(addressRepository).findByIdAndUserId(9L, 7L);
    }

    @Test
    void getAddressWhenNotOwnedThrowsNotFound() {
        when(addressRepository.findByIdAndUserId(9L, 7L)).thenReturn(Optional.empty());

        AppException error = assertThrows(AppException.class, () -> addressService.getAddress(7L, 9L));

        assertEquals(HttpStatus.NOT_FOUND, error.getStatus());
        verifyNoInteractions(addressMapper);
    }

    @Test
    void createFirstAddressAutomaticallyMakesItDefault() {
        User user = User.builder().id(7L).build();
        CreateAddressRequest request = createRequest(false);
        Address address = Address.builder().id(9L).build();
        AddressResponse expected = response(9L, true);
        when(addressRepository.countByUserId(7L)).thenReturn(0);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(addressMapper.toAddress(request, user, true)).thenReturn(address);
        when(addressRepository.save(address)).thenReturn(address);
        when(addressMapper.toResponse(address)).thenReturn(expected);

        assertSame(expected, addressService.createAddress(7L, request));
        verify(addressRepository).clearDefaultByUserId(7L);
        verify(addressMapper).toAddress(request, user, true);
    }

    @Test
    void createNonDefaultAddressDoesNotClearExistingDefault() {
        User user = User.builder().id(7L).build();
        CreateAddressRequest request = createRequest(false);
        Address address = Address.builder().id(9L).build();
        when(addressRepository.countByUserId(7L)).thenReturn(4);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(addressMapper.toAddress(request, user, false)).thenReturn(address);
        when(addressRepository.save(address)).thenReturn(address);

        addressService.createAddress(7L, request);

        verify(addressRepository, never()).clearDefaultByUserId(any());
        verify(addressMapper).toAddress(request, user, false);
    }

    @Test
    void createExplicitDefaultClearsOldDefault() {
        User user = User.builder().id(7L).build();
        CreateAddressRequest request = createRequest(true);
        Address address = Address.builder().id(9L).build();
        when(addressRepository.countByUserId(7L)).thenReturn(4);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(addressMapper.toAddress(request, user, true)).thenReturn(address);
        when(addressRepository.save(address)).thenReturn(address);

        addressService.createAddress(7L, request);

        verify(addressRepository).clearDefaultByUserId(7L);
    }

    @Test
    void createSixthAddressIsRejectedBeforeLookingUpUser() {
        when(addressRepository.countByUserId(7L)).thenReturn(5);

        AppException error = assertThrows(AppException.class,
                () -> addressService.createAddress(7L, createRequest(false)));

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatus());
        verifyNoInteractions(userRepository, addressMapper);
        verify(addressRepository, never()).save(any());
    }

    @Test
    void createAddressWhenUserDoesNotExistThrowsNotFound() {
        when(addressRepository.countByUserId(7L)).thenReturn(0);
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        AppException error = assertThrows(AppException.class,
                () -> addressService.createAddress(7L, createRequest(false)));

        assertEquals(HttpStatus.NOT_FOUND, error.getStatus());
        verify(addressRepository, never()).save(any());
    }

    @Test
    void updateAddressChangesFieldsAndCanMakeAddressDefault() {
        Address address = Address.builder().id(9L).isDefault(false).build();
        UpdateAddressRequest request = updateRequest(true);
        when(addressRepository.findByIdAndUserId(9L, 7L)).thenReturn(Optional.of(address));
        when(addressRepository.save(address)).thenReturn(address);

        addressService.updateAddress(7L, 9L, request);

        assertAll(
                () -> assertTrue(address.getIsDefault()),
                () -> assertEquals("Nguyen Van B", address.getFullName()),
                () -> assertEquals("0912345678", address.getPhone()),
                () -> assertEquals(1442, address.getDistrictId()),
                () -> assertEquals("20101", address.getWardCode()));
        verify(addressRepository).clearDefaultByUserId(7L);
        verify(addressRepository).save(address);
    }

    @Test
    void deleteNonDefaultAddressDoesNotPromoteAnotherAddress() {
        Address address = Address.builder().id(9L).isDefault(false).build();
        when(addressRepository.findByIdAndUserId(9L, 7L)).thenReturn(Optional.of(address));

        addressService.deleteAddress(7L, 9L);

        verify(addressRepository).delete(address);
        verify(addressRepository, never()).findAllByUserIdOrdered(any());
    }

    @Test
    void deleteDefaultAddressPromotesFirstRemainingAddress() {
        Address removed = Address.builder().id(9L).isDefault(true).build();
        Address remaining = Address.builder().id(10L).isDefault(false).build();
        when(addressRepository.findByIdAndUserId(9L, 7L)).thenReturn(Optional.of(removed));
        when(addressRepository.findAllByUserIdOrdered(7L)).thenReturn(List.of(remaining));

        addressService.deleteAddress(7L, 9L);

        assertTrue(remaining.getIsDefault());
        verify(addressRepository).save(remaining);
    }

    @Test
    void setDefaultWhenAlreadyDefaultDoesNotWriteDatabase() {
        Address address = Address.builder().id(9L).isDefault(true).build();
        AddressResponse expected = response(9L, true);
        when(addressRepository.findByIdAndUserId(9L, 7L)).thenReturn(Optional.of(address));
        when(addressMapper.toResponse(address)).thenReturn(expected);

        assertSame(expected, addressService.setDefault(7L, 9L));
        verify(addressRepository, never()).clearDefaultByUserId(any());
        verify(addressRepository, never()).save(any());
    }

    @Test
    void setDefaultClearsOldDefaultAndSavesSelectedAddress() {
        Address address = Address.builder().id(9L).isDefault(false).build();
        when(addressRepository.findByIdAndUserId(9L, 7L)).thenReturn(Optional.of(address));
        when(addressRepository.save(address)).thenReturn(address);

        addressService.setDefault(7L, 9L);

        assertTrue(address.getIsDefault());
        verify(addressRepository).clearDefaultByUserId(7L);
        verify(addressRepository).save(address);
    }

    private CreateAddressRequest createRequest(boolean isDefault) {
        CreateAddressRequest request = new CreateAddressRequest();
        request.setFullName("Nguyen Van A");
        request.setPhone("0901234567");
        request.setProvince("TP. Ho Chi Minh");
        request.setDistrict("Quan 1");
        request.setWard("Ben Nghe");
        request.setDetail("123 Nguyen Hue");
        request.setIsDefault(isDefault);
        return request;
    }

    private UpdateAddressRequest updateRequest(boolean isDefault) {
        UpdateAddressRequest request = new UpdateAddressRequest();
        request.setFullName("Nguyen Van B");
        request.setPhone("0912345678");
        request.setProvince("TP. Ho Chi Minh");
        request.setDistrict("Quan 10");
        request.setWard("Phuong 1");
        request.setDetail("456 Cach Mang Thang 8");
        request.setDistrictId(1442);
        request.setWardCode("20101");
        request.setIsDefault(isDefault);
        return request;
    }

    private AddressResponse response(Long id, boolean isDefault) {
        return AddressResponse.builder().id(id).detail("123 Nguyen Hue").ward("Ben Nghe")
                .district("Quan 1").province("TP. Ho Chi Minh").isDefault(isDefault).build();
    }
}
