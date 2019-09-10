package com.ubcare.buzz.Model.DialogFlow;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.List;

public class Fulfillment {
    @SerializedName("messages")
    @Expose
    private List<Messages> messages;

    @SerializedName("speech")
    @Expose
    private String speech;

    public List<Messages> getMessages() {
        return messages;
    }

    public void setMessages(List<Messages> messages) {
        this.messages = messages;
    }

    public String getSpeech() {
        return speech;
    }

    public void setSpeech(String speech) {
        this.speech = speech;
    }
}
