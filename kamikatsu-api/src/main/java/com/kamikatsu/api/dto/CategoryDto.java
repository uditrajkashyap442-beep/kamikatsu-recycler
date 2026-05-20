package com.kamikatsu.api.dto;

import java.time.LocalDateTime;

public class CategoryDto {
    private Integer id;
    private String code;
    private String name;
    private String description;
    private String disposalMethod;
    private String imageUrl;
    private MainTypeDto mainType;

    public CategoryDto() {}

    public CategoryDto(Integer id, String code, String name, String description, String disposalMethod, String imageUrl, MainTypeDto mainType) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.disposalMethod = disposalMethod;
        this.imageUrl = imageUrl;
        this.mainType = mainType;
    }

    public Integer getId() { return id; }

    public void setId(Integer id) { this.id = id; }

    public String getCode() { return code; }

    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public String getDisposalMethod() { return disposalMethod; }

    public void setDisposalMethod(String disposalMethod) { this.disposalMethod = disposalMethod; }

    public String getImageUrl() { return imageUrl; }

    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public MainTypeDto getMainType() { return mainType; }

    public void setMainType(MainTypeDto mainType) { this.mainType = mainType; }

}
