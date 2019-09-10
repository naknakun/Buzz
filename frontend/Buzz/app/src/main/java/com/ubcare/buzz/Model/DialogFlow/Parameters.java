package com.ubcare.buzz.Model.DialogFlow;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

public class Parameters {
    @SerializedName("ClinicName")
    @Expose
    private String clinicName;

    @SerializedName("date-time")
    @Expose
    private String dateTime;

    @SerializedName("date")
    @Expose
    private String date;

    @SerializedName("time")
    @Expose
    private String time;

    @SerializedName("ClinicName.original")
    @Expose
    private String clinicNameOriginal;

    @SerializedName("date-time.original")
    @Expose
    private String dateTimeOriginal;

    @SerializedName("date.original")
    @Expose
    private String dateOriginal;

    @SerializedName("time.original")
    @Expose
    private String timeOriginal;


    public String getClinicName() {
        return clinicName;
    }

    public void setClinicName(String clinicName) {
        this.clinicName = clinicName;
    }

    public String getDateTime() {
        return dateTime;
    }

    public void setDateTime(String dateTime) {
        this.dateTime = dateTime;
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

    public String getClinicNameOriginal() {
        return clinicNameOriginal;
    }

    public void setClinicNameOriginal(String clinicNameOriginal) {
        this.clinicNameOriginal = clinicNameOriginal;
    }

    public String getDateTimeOriginal() {
        return dateTimeOriginal;
    }

    public void setDateTimeOriginal(String dateTimeOriginal) {
        this.dateTimeOriginal = dateTimeOriginal;
    }

    public String getDateOriginal() {
        return dateOriginal;
    }

    public void setDateOriginal(String dateOriginal) {
        this.dateOriginal = dateOriginal;
    }

    public String getTimeOriginal() {
        return timeOriginal;
    }

    public void setTimeOriginal(String timeOriginal) {
        this.timeOriginal = timeOriginal;
    }
}
