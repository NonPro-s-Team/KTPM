package com.greenjuicehub.backend.dto.order.request;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Getter
@Setter
public class ShippingFeeRequest {
    @NotNull
    @Positive
    private Long addressId;

    // Cart flow
    private List<@NotNull @Positive Long> cartItemIds;

    // BuyNow flow
    @Positive
    private Long variantId;
    @Positive
    private Integer quantity;
}
