package com.isd17.aims.dtos.payment.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VNPayRefundResponse {
    @JsonProperty("vnp_ResponseId")
    private String vnpResponseId;
    @JsonProperty("vnp_Command")
    private String vnpCommand;
    @JsonProperty("vnp_TmnCode")
    private String vnpTmnCode;
    @JsonProperty("vnp_TxnRef")
    private String vnpTxnRef;
    @JsonProperty("vnp_Amount")
    private String vnpAmount;
    @JsonProperty("vnp_OrderInfo")
    private String vnpOrderInfo;
    @JsonProperty("vnp_ResponseCode")
    private String vnpResponseCode;
    @JsonProperty("vnp_Message")
    private String vnpMessage;
    @JsonProperty("vnp_BankCode")
    private String vnpBankCode;
    @JsonProperty("vnp_PayDate")
    private String vnpPayDate;
    @JsonProperty("vnp_TransactionNo")
    private String vnpTransactionNo;
    @JsonProperty("vnp_TransactionType")
    private String vnpTransactionType;
    @JsonProperty("vnp_TransactionStatus")
    private String vnpTransactionStatus;
    @JsonProperty("vnp_SecureHash")
    private String vnpSecureHash;
}
