package com.ubcare.buzz.Model.DialogFlow;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

public class Metadata {
    @SerializedName("intentId")
    @Expose
    private String intentId;

    @SerializedName("intentName")
    @Expose
    private String intentName;

    @SerializedName("webhookUsed")
    @Expose
    private String webhookUsed;

    public String getIntentId() {
        return intentId;
    }

    public void setIntentId(String intentId) {
        this.intentId = intentId;
    }

    public String getIntentName() {
        return intentName;
    }

    public void setIntentName(String intentName) {
        this.intentName = intentName;
    }

    public String getWebhookUsed() {
        return webhookUsed;
    }

    public void setWebhookUsed(String webhookUsed) {
        this.webhookUsed = webhookUsed;
    }
}
