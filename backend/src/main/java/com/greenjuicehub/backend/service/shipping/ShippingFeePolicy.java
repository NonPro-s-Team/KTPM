package com.greenjuicehub.backend.service.shipping;

import com.greenjuicehub.backend.entity.Address;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;

/** Current business coverage: GHN quotes only within Ho Chi Minh City. */
public final class ShippingFeePolicy {
    public static final BigDecimal FIXED_FEE = BigDecimal.valueOf(30_000);
    private static final Set<String> HCM_NAMES = Set.of("ho chi minh", "tp ho chi minh",
            "thanh pho ho chi minh", "tphcm", "tp hcm", "hcm", "ho chi minh city");

    private ShippingFeePolicy() { }

    public static boolean canUseCarrierQuote(Address address) {
        if (address.getProvince() == null || address.getDistrictId() == null || address.getWardCode() == null
                || address.getWardCode().isBlank()) return false;
        String province = Normalizer.normalize(address.getProvince(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").replace('.', ' ').trim().toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ");
        return HCM_NAMES.contains(province);
    }
}
