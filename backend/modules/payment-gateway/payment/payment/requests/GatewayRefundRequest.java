package com.isd17.aims.dtos.payment.requests;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GatewayRefundRequest {
    private String transactionId;
    private Double amount;
    private String transactionNo;
    private String ipAddress;
    private String transactionDateTime;
    private String createBy;
}
