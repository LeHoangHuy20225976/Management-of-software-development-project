package com.isd17.aims.subsystem.payment;

import com.isd17.aims.dtos.payment.requests.GatewayPayRequest;
import com.isd17.aims.dtos.payment.requests.GatewayRefundRequest;
import com.isd17.aims.dtos.payment.responses.GatewayPayResponse;
import com.isd17.aims.dtos.payment.responses.GatewayRefundResponse;

public interface PaymentGateway {
    String method();

    GatewayPayResponse initiatePayment(GatewayPayRequest request);

    GatewayRefundResponse refund(GatewayRefundRequest request);
}
