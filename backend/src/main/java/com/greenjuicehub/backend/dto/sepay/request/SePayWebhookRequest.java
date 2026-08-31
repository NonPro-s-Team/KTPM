package com.greenjuicehub.backend.dto.sepay.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter @Setter
public class SePayWebhookRequest {
    private Long id;
    private String gateway;
    private String transactionDate;
    private String accountNumber;
    private String subAccount;
    @NotNull
    @Pattern(regexp = "in|out")
    private String transferType;
    @NotNull
    @DecimalMin(value = "0", inclusive = false)
    private BigDecimal transferAmount;
    private BigDecimal accumulated;
    private String code;
    private String content;
    private String referenceCode;
    private String description;
}
