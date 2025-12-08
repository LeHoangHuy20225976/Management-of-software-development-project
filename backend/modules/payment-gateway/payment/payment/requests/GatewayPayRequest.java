package com.isd17.aims.dtos.payment.requests;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class GatewayPayRequest {
    private UUID orderId;
    private Double amount;
    private String ipAddress;
}
