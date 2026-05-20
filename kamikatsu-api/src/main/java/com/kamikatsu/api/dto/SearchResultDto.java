package com.kamikatsu.api.dto;

public class SearchResultDto {
    private Integer id;
    private String name;
    private String description;
    private String categoryName;
    private String mainTypeName;
    private String categoryCode;

    public SearchResultDto() {}

    public SearchResultDto(Integer id, String name, String description, String categoryName, String mainTypeName, String categoryCode) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.categoryName = categoryName;
        this.mainTypeName = mainTypeName;
        this.categoryCode = categoryCode;
    }

    public Integer getId() { return id; }

    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public String getCategoryName() { return categoryName; }

    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getMainTypeName() { return mainTypeName; }

    public void setMainTypeName(String mainTypeName) { this.mainTypeName = mainTypeName; }

    public String getCategoryCode() { return categoryCode; }

    public void setCategoryCode(String categoryCode) { this.categoryCode = categoryCode; }
}
