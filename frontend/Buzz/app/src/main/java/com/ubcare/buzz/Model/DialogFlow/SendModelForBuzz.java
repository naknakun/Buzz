package com.ubcare.buzz.Model.DialogFlow;

public class SendModelForBuzz {
    private String patientId;
    private String intent;
    private String clinicName;
    private String date;
    private String time;

    public String getPatientId() { return patientId; }

    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) { this.intent = intent; }

    public String getClinicName() {
        return clinicName;
    }

    public void setClinicName(String clinicName) {
        this.clinicName = clinicName;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }



}
