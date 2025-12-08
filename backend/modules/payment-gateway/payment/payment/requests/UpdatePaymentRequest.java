package com.isd17.aims.dtos.payment.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class UpdatePaymentRequest {
    @NotNull(message = "Order id is required")
    private UUID orderId;

    @NotBlank(message = "status can not be empty")
    @Pattern(
            regexp = "^(successful|failed|refunded|pending)$",
            message = "status must be one of: successful, failed, refunded, pending"
    )
    private String status;

    @NotBlank(message = "Gateway transaction no is required")
    private String transactionNo;
}