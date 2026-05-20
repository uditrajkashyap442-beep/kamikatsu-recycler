package com.kamikatsu.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "main_types")
public class MainType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    private String iconName;
    private String colorHex;
    private LocalDateTime createdAt;

    public MainType() {}

    public MainType(Integer id, String name, String iconName, String colorHex, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.iconName = iconName;
        this.colorHex = colorHex;
        this.createdAt = createdAt;
    }

    public Integer getId() { return id; }

    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getIconName() { return iconName; }

    public void setIconName(String iconName) { this.iconName = iconName; }

    public String getColorHex() { return colorHex; }

    public void setColorHex(String colorHex) { this.colorHex = colorHex; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

}
