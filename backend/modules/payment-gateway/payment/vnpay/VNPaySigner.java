package com.isd17.aims.subsystem.payment.vnpay;

import com.isd17.aims.dtos.payment.responses.VNPayRefundResponse;
import com.isd17.aims.utils.PaymentUtils;

class VNPaySigner {
    public static void verifyRefundResponse(VNPayConfig cfg, VNPayRefundResponse resp) {
        String data = String.join("|",
                resp.getVnpResponseId(),
                resp.getVnpCommand(),
                resp.getVnpResponseCode(),
                resp.getVnpMessage(),
                resp.getVnpTmnCode(),
                resp.getVnpTxnRef(),
                resp.getVnpAmount(),
                resp.getVnpBankCode(),
                resp.getVnpPayDate(),
                resp.getVnpTransactionNo(),
                resp.getVnpTransactionType(),
                resp.getVnpTransactionStatus(),
                resp.getVnpOrderInfo()
        );
        String ourHash = PaymentUtils.hmacSHA512(cfg.getSecretKey(), data);
        if (!ourHash.equalsIgnoreCase(resp.getVnpSecureHash()))
            throw new SecurityException("VNPAY refund response hash mismatch");
    }
}
