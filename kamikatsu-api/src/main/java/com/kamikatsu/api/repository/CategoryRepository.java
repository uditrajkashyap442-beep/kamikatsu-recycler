package com.kamikatsu.api.repository;

import com.kamikatsu.api.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    Optional<Category> findByCode(String code);
    List<Category> findByMainType(MainType mainType);
    List<Category> findByNameContainingIgnoreCase(String name);
}
