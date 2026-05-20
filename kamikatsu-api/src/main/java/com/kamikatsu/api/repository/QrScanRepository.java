package com.kamikatsu.api.repository;

import com.kamikatsu.api.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QrScanRepository extends JpaRepository<QrScan, Integer> {
    List<QrScan> findByProduct(Product product);
}
