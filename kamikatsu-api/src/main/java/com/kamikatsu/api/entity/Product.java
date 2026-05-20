package com.kamikatsu.api.entity;

import jakarta.persistence.*;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.KeywordField;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Indexed
public class Product {
    @jakarta.persistence.Id
    @org.springframework.data.annotation.Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    @Column(nullable = false)
    @FullTextField(analyzer = "kuromoji")
    private String name;
    
    @FullTextField(analyzer = "kuromoji")
    private String description;
    @Enumerated(EnumType.STRING)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private ItemClassification classification;
    
    @Enumerated(EnumType.STRING)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private CostStatus costStatus;
    private String kurukuruLocation;
    private Boolean homeOnly;
    private String preparationSteps;
    private String imageUrl;
    
    @Column(unique = true)
    @KeywordField
    private String barcode;
    
    private LocalDateTime createdAt;

    public Product() {}

    public Product(Integer id, Category category, String name, String description, ItemClassification classification, CostStatus costStatus, String kurukuruLocation, Boolean homeOnly, String preparationSteps, String imageUrl, String barcode, LocalDateTime createdAt) {
        this.id = id;
        this.category = category;
        this.name = name;
        this.description = description;
        this.classification = classification;
        this.costStatus = costStatus;
        this.kurukuruLocation = kurukuruLocation;
        this.homeOnly = homeOnly;
        this.preparationSteps = preparationSteps;
        this.imageUrl = imageUrl;
        this.barcode = barcode;
        this.createdAt = createdAt;
    }

    public Integer getId() { return id; }

    public void setId(Integer id) { this.id = id; }

    public Category getCategory() { return category; }

    public void setCategory(Category category) { this.category = category; }

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

    public String getBarcode() { return barcode; }

    public void setBarcode(String barcode) { this.barcode = barcode; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

}
