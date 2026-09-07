package com.greenjuicehub.backend.service.shipping;

import com.greenjuicehub.backend.entity.Address;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class ShippingFeePolicyTest {
    @ParameterizedTest
    @ValueSource(strings = {"Hồ Chí Minh", "TP. Hồ Chí Minh", "Thành phố Hồ Chí Minh", "TP.HCM"})
    void hcmNamesUseCarrierOnlyWithCompleteIdentifiers(String province) {
        Address address = Address.builder().province(province).districtId(1454).wardCode("20101").build();
        assertTrue(ShippingFeePolicy.canUseCarrierQuote(address));
        address.setWardCode(null);
        assertFalse(ShippingFeePolicy.canUseCarrierQuote(address));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"Hà Nội", "Đà Nẵng", "Hồ Chí Minh giả"})
    void outsideCoverageNeverUsesCarrierEvenWithIdentifiers(String province) {
        Address address = Address.builder().province(province).districtId(1485).wardCode("10001").build();
        assertFalse(ShippingFeePolicy.canUseCarrierQuote(address));
    }
}
