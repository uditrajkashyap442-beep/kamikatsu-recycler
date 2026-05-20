package com.kamikatsu.api.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum CostStatus {
    free("free"),
    paid("paid"),
    donation("donation");

    private final String pgValue;

    CostStatus(String pgValue) {
        this.pgValue = pgValue;
    }

    @JsonValue
    public String getPgValue() {
        return pgValue;
    }

    @JsonCreator
    public static CostStatus fromPgValue(String value) {
        if (value == null) return null;
        for (CostStatus status : values()) {
            if (status.pgValue.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown pg value: " + value);
    }
}
