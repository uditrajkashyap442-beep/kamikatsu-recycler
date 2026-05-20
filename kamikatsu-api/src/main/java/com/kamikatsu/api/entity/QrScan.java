package com.kamikatsu.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "qr_scans")
public class QrScan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    private String userSessionId;
    private LocalDateTime scannedAt;

    public QrScan() {}

    public QrScan(Integer id, Product product, String userSessionId, LocalDateTime scannedAt) {
        this.id = id;
        this.product = product;
        this.userSessionId = userSessionId;
        this.scannedAt = scannedAt;
    }

    public Integer getId() { return id; }

    public void setId(Integer id) { this.id = id; }

    public Product getProduct() { return product; }

    public void setProduct(Product product) { this.product = product; }

    public String getUserSessionId() { return userSessionId; }

    public void setUserSessionId(String userSessionId) { this.userSessionId = userSessionId; }

    public LocalDateTime getScannedAt() { return scannedAt; }

    public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }

}
