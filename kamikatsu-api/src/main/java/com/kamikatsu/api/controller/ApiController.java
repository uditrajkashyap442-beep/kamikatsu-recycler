package com.kamikatsu.api.controller;

import com.kamikatsu.api.dto.*;
import com.kamikatsu.api.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.scheduling.annotation.Scheduled;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@CrossOrigin("*")
public class ApiController {
    private final SearchService searchService;
    private final Map<String, AtomicInteger> requestCountsPerIp = new ConcurrentHashMap<>();

    @Scheduled(fixedRate = 60000)
    public void resetRateLimits() {
        requestCountsPerIp.clear();
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String q, @RequestParam(defaultValue = "false") boolean useAi, HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        AtomicInteger count = requestCountsPerIp.computeIfAbsent(ip, k -> new AtomicInteger(0));
        if (count.incrementAndGet() > 60) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("Rate limit exceeded. Try again in a minute.");
        }
        
        List<SearchResultDto> results = searchService.searchProducts(q, useAi);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Integer id) {
        ProductDto product = searchService.getProductById(id);
        if (product != null) {
            return ResponseEntity.ok(product);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/category/{code}")
    public ResponseEntity<CategoryDto> getCategory(@PathVariable String code) {
        CategoryDto category = searchService.getCategoryByCode(code);
        if (category != null) {
            return ResponseEntity.ok(category);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/category/{code}/products")
    public ResponseEntity<List<ProductDto>> getCategoryProducts(@PathVariable String code) {
        List<ProductDto> products = searchService.getProductsByCategoryCode(code);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ProductDto> getProductByBarcode(@PathVariable String barcode) {
        ProductDto product = searchService.getProductByBarcode(barcode);
        if (product != null) {
            return ResponseEntity.ok(product);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/qr-scan")
    public ResponseEntity<Void> logQrScan(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) String categoryCode,
            @RequestParam(required = false) String sessionId,
            @RequestParam(required = false) Long userId) {
        searchService.recordQrScan(productId, categoryCode, sessionId, userId);
        return ResponseEntity.ok().build();
    }

    public ApiController(SearchService searchService) {
        this.searchService = searchService;
    }
}
