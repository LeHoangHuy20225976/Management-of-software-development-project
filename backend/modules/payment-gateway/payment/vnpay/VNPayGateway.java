package com.isd17.aims.subsystem.payment.vnpay;

import com.isd17.aims.dtos.payment.requests.GatewayPayRequest;
import com.isd17.aims.dtos.payment.requests.GatewayRefundRequest;
import com.isd17.aims.dtos.payment.responses.GatewayPayResponse;
import com.isd17.aims.dtos.payment.responses.GatewayRefundResponse;
import com.isd17.aims.dtos.payment.responses.VNPayRefundResponse;
import com.isd17.aims.subsystem.payment.PaymentGateway;
import com.isd17.aims.utils.PaymentUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class VNPayGateway implements PaymentGateway {
    private final VNPayConfig config;
    private final WebClient webClient;

    @Override
    public String method() {
        return "VNPay";
    }

    @Override
    public GatewayPayResponse initiatePayment(GatewayPayRequest request) {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", config.getVersion());
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", config.getTmnCode());
        params.put("vnp_Amount", String.valueOf(request.getAmount().longValue() * 100L));
        params.put("vnp_BankCode", "VNBANK");
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_IpAddr", request.getIpAddress());
        params.put("vnp_Locale", "vn");
        String orderInfo = "Pay for order " + request.getOrderId().toString().replace("-", "");
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", config.getOrderType());
        params.put("vnp_ReturnUrl", config.getReturnUrl());

        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(calendar.getTime());
        params.put("vnp_CreateDate", vnpCreateDate);
        calendar.add(Calendar.MINUTE, 15);
        String vnpExpireDate = formatter.format(calendar.getTime());
        params.put("vnp_ExpireDate", vnpExpireDate);
        String txnRef = PaymentUtils.randomTransactionRef(16);
        params.put("vnp_TxnRef", txnRef);

        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                //Build the query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = PaymentUtils.hmacSHA512(config.getSecretKey(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = config.getPayUrl() + "?" + queryUrl;
        return GatewayPayResponse.builder()
                .redirectUrl(paymentUrl)
                .transactionId(txnRef)
                .transactionContent(orderInfo)
                .transactionDatetime(vnpCreateDate)
                .build();
    }

    @Override
    public GatewayRefundResponse refund(GatewayRefundRequest request) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_RequestId", PaymentUtils.randomTransactionRef(16));
        params.put("vnp_Version", config.getVersion());
        params.put("vnp_Command", "refund");
        params.put("vnp_TmnCode", config.getTmnCode());
        params.put("vnp_TransactionType", "02");
        params.put("vnp_TxnRef", request.getTransactionId());
        params.put("vnp_Amount", String.valueOf(request.getAmount().longValue() * 100L));
        params.put("vnp_TransactionNo", request.getTransactionNo());
        params.put("vnp_TransactionDate", request.getTransactionDateTime());
        params.put("vnp_CreateBy", request.getCreateBy());
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(calendar.getTime());
        params.put("vnp_CreateDate", vnpCreateDate);
        params.put("vnp_IpAddr", request.getIpAddress());
        params.put("vnp_OrderInfo", "Refund for transaction " + request.getTransactionId());
        String hashData = params.values().stream()
                .filter(s -> s != null && !s.isEmpty())
                .collect(Collectors.joining("|"));
        params.put("vnp_SecureHash", PaymentUtils.hmacSHA512(config.getSecretKey(), hashData));
        try {
            // Log the request details
            log.info("Sending refund request to VNPay:");
            log.info("Request parameters: {}", params);
            VNPayRefundResponse response = webClient
                    .post()
                    .uri(config.getApiUrl())
                    .bodyValue(params)
                    .retrieve()
                    .bodyToMono(VNPayRefundResponse.class)
                    .block();
            // Log the response
            log.info("Received response from VNPay: {}", response);
            if (response != null) {
                boolean isSuccess = response.getVnpResponseCode().equals("00");
                if (isSuccess)
                    VNPaySigner.verifyRefundResponse(config, response);
                return GatewayRefundResponse.builder()
                        .isSuccess(isSuccess)
                        .gatewayResponseCode(response.getVnpResponseCode())
                        .message(response.getVnpMessage())
                        .build();
            }
        } catch (Exception e) {
            log.error("Error during VNPay refund request: ", e);
        }
        return null;
    }
}
