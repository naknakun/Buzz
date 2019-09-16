package com.ubcare.buzz.Model.Buzz;

public class ResponseModelBuzz {
    private int TYPE;
    private String TEXT;
    private boolean dialogStart;


    public int getTYPE() {
        return TYPE;
    }

    public void setTYPE(int TYPE) {
        this.TYPE = TYPE;
    }

    public String getTEXT() {
        return TEXT;
    }

    public void setTEXT(String TEXT) {
        this.TEXT = TEXT;
    }

    public boolean isDialogStart() {
        return dialogStart;
    }

    public void setDialogStart(boolean dialogStart) {
        this.dialogStart = dialogStart;
    }
}
