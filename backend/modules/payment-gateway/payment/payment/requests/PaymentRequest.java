package com.isd17.aims.dtos.payment.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class PaymentRequest {
    @NotNull(message = "Order id is required")
    private UUID orderId;
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
}
