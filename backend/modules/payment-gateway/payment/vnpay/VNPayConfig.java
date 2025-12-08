package com.isd17.aims.subsystem.payment.vnpay;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.payment.vnpay")
@Getter
@Setter
class VNPayConfig {
    private String payUrl;
    private String returnUrl;
    private String tmnCode;
    private String secretKey;
    private String apiUrl;
    private String version;
    private String orderType;
}

