package com.ubcare.buzz.Model.DialogFlow;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

public class DialogFlow {

    @SerializedName("id")
    @Expose
    private String id;

    @SerializedName("lang")
    @Expose
    private String lang;

    @SerializedName("result")
    @Expose
    private Result result;

    @SerializedName("sessionId")
    @Expose
    private String sessionId;

    @SerializedName("status")
    @Expose
    private Status status;

    @SerializedName("timestamp")
    @Expose
    private String timestamp;

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

    public String getLang() {
        return lang;
    }
    public void setLang(String lang){
        this.lang = lang;
    }

    public Result getResult() {
        return result;
    }
    public void setResult(Result result){
        this.result = result;
    }

    public String getSessionId() {
        return sessionId;
    }
    public void setSessionId(String sessionId){
        this.sessionId = sessionId;
    }

    public Status getStatus() {
        return status;
    }
    public void setStatus(Status status){
        this.status = status;
    }

    public String getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(String timestamp){
        this.timestamp = timestamp;
    }
}
