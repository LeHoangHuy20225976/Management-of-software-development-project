package com.isd17.aims.subsystem.payment;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class PaymentGatewayResolver {
    private final Map<String, PaymentGateway> gateways;

    public PaymentGatewayResolver(List<PaymentGateway> gateways) {
        this.gateways = gateways.stream().collect(
                Collectors.toUnmodifiableMap(
                        PaymentGateway::method,
                        paymentGateway -> paymentGateway,
                        (a, b) -> {
                            throw new IllegalStateException("Duplicate gateway for: " + a.method());
                        }
                )
        );
    }

    public PaymentGateway resolve(String method) {
        PaymentGateway paymentGateway = gateways.get(method);
        if (paymentGateway == null)
            throw new IllegalArgumentException("No payment gateway found for payment method " + method);
        return paymentGateway;
    }
}
