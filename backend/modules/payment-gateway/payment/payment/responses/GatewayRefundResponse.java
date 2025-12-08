package com.isd17.aims.dtos.payment.responses;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GatewayRefundResponse {
    private boolean isSuccess;
    private String gatewayResponseCode;
    private String message;
}
