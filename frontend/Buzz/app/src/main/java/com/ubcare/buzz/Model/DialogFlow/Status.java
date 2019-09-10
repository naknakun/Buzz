package com.ubcare.buzz.Model.DialogFlow;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

public class Status {
    @SerializedName("code")
    @Expose
    private String code;

    @SerializedName("errorDetails")
    @Expose
    private String errorDetails;

    @SerializedName("errorType")
    @Expose
    private String errorType;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getErrorDetails() {
        return errorDetails;
    }

    public void setErrorDetails(String errorDetails) {
        this.errorDetails = errorDetails;
    }

    public String getErrorType() {
        return errorType;
    }

    public void setErrorType(String errorType) {
        this.errorType = errorType;
    }
}
