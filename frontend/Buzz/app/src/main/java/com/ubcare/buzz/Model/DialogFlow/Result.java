package com.ubcare.buzz.Model.DialogFlow;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.List;

public class Result {
    @SerializedName("action")
    @Expose
    private String action;

    @SerializedName("actionIncomplete")
    @Expose
    private boolean actionIncomplete;

    @SerializedName("contexts")
    @Expose
    private List<Contexts> contexts;

    @SerializedName("fulfillment")
    @Expose
    private Fulfillment fulfillment;

    @SerializedName("metadata")
    @Expose
    private Metadata metadata;

    @SerializedName("parameters")
    @Expose
    private Parameters parameters;

    @SerializedName("resolvedQuery")
    @Expose
    private String resolvedQuery;

    @SerializedName("score")
    @Expose
    private Double score;

    @SerializedName("source")
    @Expose
    private String source;

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Boolean getActionIncomplete() {
        return actionIncomplete;
    }

    public void setActionIncomplete(Boolean actionIncomplete) {
        this.actionIncomplete = actionIncomplete;
    }

    public List<Contexts> getContexts() {
        return contexts;
    }

    public void setContexts(List<Contexts> contexts) {
        this.contexts = contexts;
    }

    public Fulfillment getFulfillment() {
        return fulfillment;
    }

    public void setFulfillment(Fulfillment fulfillment) {
        this.fulfillment = fulfillment;
    }

    public Metadata getMetadata() {
        return metadata;
    }

    public void setMetadata(Metadata metadata) {
        this.metadata = metadata;
    }

    public Parameters getParameters() {
        return parameters;
    }

    public void setParameters(Parameters parameters) {
        this.parameters = parameters;
    }

    public String getResolvedQuery() {
        return resolvedQuery;
    }

    public void setResolvedQuery(String resolvedQuery) {
        this.resolvedQuery = resolvedQuery;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
