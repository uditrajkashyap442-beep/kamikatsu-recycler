package com.kamikatsu.api.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ItemClassification {
    hazardous("hazardous"),
    recyclable("recyclable"),
    compostable("compostable"),
    reusable("reusable");

    private final String pgValue;

    ItemClassification(String pgValue) {
        this.pgValue = pgValue;
    }

    @JsonValue
    public String getPgValue() {
        return pgValue;
    }

    @JsonCreator
    public static ItemClassification fromPgValue(String value) {
        if (value == null) return null;
        for (ItemClassification classification : values()) {
            if (classification.pgValue.equalsIgnoreCase(value)) {
                return classification;
            }
        }
        throw new IllegalArgumentException("Unknown pg value: " + value);
    }
}
