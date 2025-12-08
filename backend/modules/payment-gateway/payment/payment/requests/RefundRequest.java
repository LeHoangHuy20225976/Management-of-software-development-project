package com.isd17.aims.dtos.payment.requests;

import com.isd17.aims.models.PaymentEntity;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RefundRequest {
    private PaymentEntity payment;
    private String ipAddress;
    private String createBy;
}
