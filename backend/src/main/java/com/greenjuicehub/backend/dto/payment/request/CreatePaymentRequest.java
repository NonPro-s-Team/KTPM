package com.greenjuicehub.backend.dto.payment.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePaymentRequest {
    @NotNull
    @Positive
    private Long orderId;
}
