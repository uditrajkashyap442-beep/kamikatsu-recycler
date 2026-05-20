package com.kamikatsu.api.dto;

import com.kamikatsu.api.entity.CostStatus;
import com.kamikatsu.api.entity.ItemClassification;
import java.time.LocalDateTime;

public class ProductDto {
    private Integer id;
    private String name;
    private String description;
    private ItemClassification classification;
    private CostStatus costStatus;
    private String kurukuruLocation;
    private Boolean homeOnly;
    private String preparationSteps;
    private String imageUrl;
    private CategoryDto category;
    private LocalDateTime createdAt;

    public ProductDto() {}

    public ProductDto(Integer id, String name, String description, ItemClassification classification, CostStatus costStatus, String kurukuruLocation, Boolean homeOnly, String preparationSteps, String imageUrl, CategoryDto category, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.classification = classification;
        this.costStatus = costStatus;
        this.kurukuruLocation = kurukuruLocation;
        this.homeOnly = homeOnly;
        this.preparationSteps = preparationSteps;
        this.imageUrl = imageUrl;
        this.category = category;
        this.createdAt = createdAt;
    }

    public Integer getId() { return id; }

    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public ItemClassification getClassification() { return classification; }

    public void setClassification(ItemClassification classification) { this.classification = classification; }

    public CostStatus getCostStatus() { return costStatus; }

    public void setCostStatus(CostStatus costStatus) { this.costStatus = costStatus; }

    public String getKurukuruLocation() { return kurukuruLocation; }

    public void setKurukuruLocation(String kurukuruLocation) { this.kurukuruLocation = kurukuruLocation; }

    public Boolean getHomeOnly() { return homeOnly; }

    public void setHomeOnly(Boolean homeOnly) { this.homeOnly = homeOnly; }

    public String getPreparationSteps() { return preparationSteps; }

    public void setPreparationSteps(String preparationSteps) { this.preparationSteps = preparationSteps; }

    public String getImageUrl() { return imageUrl; }

    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public CategoryDto getCategory() { return category; }

    public void setCategory(CategoryDto category) { this.category = category; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

}
