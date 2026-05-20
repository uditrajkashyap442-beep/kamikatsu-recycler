package com.kamikatsu.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "main_type_id", nullable = false)
    private MainType mainType;
    
    @Column(nullable = false, unique = true)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    private String disposalMethod;
    private String imageUrl;
    private LocalDateTime createdAt;

    public Category() {}

    public Category(Integer id, MainType mainType, String code, String name, String description, String disposalMethod, String imageUrl, LocalDateTime createdAt) {
        this.id = id;
        this.mainType = mainType;
        this.code = code;
        this.name = name;
        this.description = description;
        this.disposalMethod = disposalMethod;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
    }

    public Integer getId() { return id; }

    public void setId(Integer id) { this.id = id; }

    public MainType getMainType() { return mainType; }

    public void setMainType(MainType mainType) { this.mainType = mainType; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

}
