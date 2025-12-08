package com.isd17.aims.dtos.payment;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class PaymentDTO {
    @NotNull(message = "paymentId is required")
    private UUID paymentId;

    @NotNull(message = "orderId is required")
    private UUID orderId;

    @NotBlank(message = "transactionId is required -> txfRef")
    private String transactionId;

    @NotBlank(message = "ipAddress is required")
    private String ipAddress;

    @NotBlank(message = "transactionContent is required")
    private String transactionContent;

    @NotBlank(message = "transactionDatetime is required")
    private String transactionDatetime;

    @NotNull(message = "Amount is required")
    @Positive(message = "amount must be a positive double")
    private Double amount;

    @NotBlank(message = "paymentMethod is required")
    private String paymentMethod;

    @NotBlank(message = "Status is required")
    @Pattern(
            regexp = "^(successful|failed|refunded|pending)$",
            message = "status must be one of: successful, failed, refunded, pending"
    )
    private String status;
}
