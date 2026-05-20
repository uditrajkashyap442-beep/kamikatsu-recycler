package com.kamikatsu.api.dto;

import java.time.LocalDateTime;

public class MainTypeDto {
    private Integer id;
    private String name;
    private String iconName;
    private String colorHex;

    public MainTypeDto() {}

    public MainTypeDto(Integer id, String name, String iconName, String colorHex) {
        this.id = id;
        this.name = name;
        this.iconName = iconName;
        this.colorHex = colorHex;
    }

    public Integer getId() { return id; }

    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getIconName() { return iconName; }

    public void setIconName(String iconName) { this.iconName = iconName; }

    public String getColorHex() { return colorHex; }

    public void setColorHex(String colorHex) { this.colorHex = colorHex; }

}
