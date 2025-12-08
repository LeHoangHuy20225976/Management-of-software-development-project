package com.isd17.aims.dtos.payment.responses;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GatewayPayResponse {
    private String redirectUrl;
    private String transactionId;
    private String transactionContent;
    private String transactionDatetime;
}
