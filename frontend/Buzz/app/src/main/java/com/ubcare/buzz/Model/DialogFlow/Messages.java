package com.ubcare.buzz.Model.DialogFlow;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.List;

public class Messages {
    @SerializedName("speech")
    @Expose
    private List<String> speech;

    @SerializedName("type")
    @Expose
    private int type;

    public List<String> getSpeech() {
        return speech;
    }

    public void setSpeech(List<String> speech) {
        this.speech = speech;
    }

    public int getType() {
        return type;
    }

    public void setType(int type) {
        this.type = type;
    }
}
