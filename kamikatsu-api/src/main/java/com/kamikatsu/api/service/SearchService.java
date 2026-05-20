package com.kamikatsu.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kamikatsu.api.dto.*;
import com.kamikatsu.api.entity.*;
import com.kamikatsu.api.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.hibernate.Session;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.hibernate.search.engine.search.common.BooleanOperator;
import org.hibernate.search.mapper.orm.Search;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SearchService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MainTypeRepository mainTypeRepository;
    private final QrScanRepository qrScanRepository;
    private final GeminiClassifier geminiClassifier;
    private final HeuristicClassifier heuristicClassifier;
    private final ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public List<SearchResultDto> searchProducts(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        // 1. Search local products first
        List<Product> hits = new ArrayList<>();
        try {
            SearchSession searchSession = Search.session(entityManager.unwrap(org.hibernate.Session.class));
            hits = searchSession.search(Product.class)
                .where(f -> f.simpleQueryString()
                    .fields("name", "description")
                    .matching(query)
                    .defaultOperator(BooleanOperator.AND))
                .fetchHits(20);
        } catch (Exception e) {
            // Fallback to database search if Elasticsearch is down/unreachable
            hits = productRepository.searchProducts(query);
        }

        if (hits.isEmpty()) {
            hits = productRepository.searchProducts(query);
        }

        List<SearchResultDto> results = hits.stream()
            .map(p -> new SearchResultDto(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getCategory() != null ? p.getCategory().getName() : "Unknown",
                p.getCategory() != null && p.getCategory().getMainType() != null ? p.getCategory().getMainType().getName() : "Unknown",
                p.getCategory() != null ? p.getCategory().getCode() : null
            ))
            .collect(Collectors.toCollection(ArrayList::new));

        // 2. Add local category matches (e.g. searching "Plastic" shows category-level information)
        List<Category> matchedCategories = categoryRepository.findByNameContainingIgnoreCase(query);
        for (Category cat : matchedCategories) {
            boolean exists = results.stream().anyMatch(r -> r.getName().equalsIgnoreCase(cat.getName() + " (General Disposal)"));
            if (!exists) {
                results.add(new SearchResultDto(
                    null, // Virtual product has null ID
                    cat.getName() + " (General Disposal)",
                    cat.getDescription() != null ? cat.getDescription() : "General disposal guidelines for " + cat.getName(),
                    cat.getName(),
                    cat.getMainType() != null ? cat.getMainType().getName() : "Unknown",
                    cat.getCode()
                ));
            }
        }

        // 3. Fallback to Open Food Facts, Gemini AI, and Heuristics if no local product matches
        if (results.isEmpty() || hits.isEmpty()) {
            // First: Search Open Food Facts to fetch external product details
            String offInfo = fetchProductFromOpenFoodFacts(query);

            // Second: Call Gemini AI Classifier (if key is set)
            HeuristicClassifier.ClassificationResult classificationResult = null;
            if (geminiClassifier != null) {
                classificationResult = geminiClassifier.classify(query, offInfo);
            }

            // Third: Fallback to Heuristic local rules
            if (classificationResult == null && heuristicClassifier != null) {
                classificationResult = heuristicClassifier.classify(query);
                if (classificationResult == null && offInfo != null && !offInfo.isBlank()) {
                    classificationResult = heuristicClassifier.classify(offInfo);
                }
            }

            // Fourth: Save dynamic product to local DB (caching)
            if (classificationResult != null) {
                Product cachedProduct = saveDynamicProduct(classificationResult, null);
                if (cachedProduct != null) {
                    boolean alreadyInResults = results.stream().anyMatch(r -> cachedProduct.getId().equals(r.getId()));
                    if (!alreadyInResults) {
                        results.add(0, new SearchResultDto(
                            cachedProduct.getId(),
                            cachedProduct.getName(),
                            cachedProduct.getDescription(),
                            cachedProduct.getCategory() != null ? cachedProduct.getCategory().getName() : "Unknown",
                            cachedProduct.getCategory() != null && cachedProduct.getCategory().getMainType() != null ? cachedProduct.getCategory().getMainType().getName() : "Unknown",
                            cachedProduct.getCategory() != null ? cachedProduct.getCategory().getCode() : null
                        ));
                    }
                }
            }
        }

        return results;
    }

    public ProductDto getProductById(Integer id) {
        Optional<Product> product = productRepository.findByIdEager(id);
        return product.map(this::convertToDto).orElse(null);
    }

    public CategoryDto getCategoryByCode(String code) {
        Optional<Category> category = categoryRepository.findByCode(code);
        return category.map(this::convertToDto).orElse(null);
    }

    public List<ProductDto> getProductsByCategoryCode(String code) {
        Optional<Category> category = categoryRepository.findByCode(code);
        if (category.isPresent()) {
            List<Product> products = productRepository.findByCategory(category.get());
            return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        }
        return List.of();
    }

    @Transactional
    public ProductDto getProductByBarcode(String barcode) {
        List<Product> hits = new ArrayList<>();
        try {
            SearchSession searchSession = Search.session(entityManager.unwrap(org.hibernate.Session.class));
            hits = searchSession.search(Product.class)
                .where(f -> f.match().field("barcode").matching(barcode))
                .fetchHits(1);
        } catch (Exception e) {
            hits = productRepository.findAll().stream()
                .filter(p -> barcode.equals(p.getBarcode()))
                .collect(Collectors.toList());
        }

        if (!hits.isEmpty()) {
            return convertToDto(hits.get(0));
        }

        // Barcode not found locally, query Open Food Facts / Beauty / Products / Gemini + Classify
        try {
            String offInfo = fetchFromOpenFoodFactsByBarcode(barcode);
            if (offInfo == null || offInfo.isBlank()) {
                offInfo = fetchFromOpenBeautyFactsByBarcode(barcode);
            }
            if (offInfo == null || offInfo.isBlank()) {
                offInfo = fetchFromOpenProductsFactsByBarcode(barcode);
            }
            if (offInfo == null || offInfo.isBlank()) {
                if (geminiClassifier != null) {
                    offInfo = geminiClassifier.resolveBarcodeDirectly(barcode);
                }
            }
            if (offInfo == null || offInfo.isBlank()) {
                // Heuristic guess based on barcode prefix
                String type = "International Product";
                if (barcode.startsWith("49") || barcode.startsWith("45")) {
                    type = "Japanese Consumer Product";
                } else if (barcode.startsWith("0") || barcode.startsWith("1")) {
                    type = "US/Canada Consumer Product";
                }
                offInfo = String.format("Product: Unregistered %s (Barcode %s), Brand: Generic, Packaging: Plastic Wrapper", type, barcode);
            }

            if (offInfo != null && !offInfo.isBlank()) {
                HeuristicClassifier.ClassificationResult classificationResult = null;
                if (geminiClassifier != null) {
                    classificationResult = geminiClassifier.classify("Barcode Product: " + barcode, offInfo);
                }
                if (classificationResult == null && heuristicClassifier != null) {
                    classificationResult = heuristicClassifier.classify(offInfo);
                }

                if (classificationResult != null) {
                    Product saved = saveDynamicProduct(classificationResult, barcode);
                    if (saved != null) {
                        return convertToDto(saved);
                    }
                }
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(SearchService.class).error("Error resolving barcode: ", e);
        }

        return null;
    }

    @Transactional
    public void recordQrScan(Integer productId, String categoryCode, String sessionId) {
        Product product = null;
        if (productId != null) {
            product = productRepository.findById(productId).orElse(null);
        } else if (categoryCode != null && !categoryCode.isBlank()) {
            Optional<Category> categoryOpt = categoryRepository.findByCode(categoryCode);
            if (categoryOpt.isPresent()) {
                Category category = categoryOpt.get();
                List<Product> products = productRepository.findByCategory(category);
                if (!products.isEmpty()) {
                    product = products.get(0);
                } else {
                    // Create a general/virtual product for this category so we can log the scan
                    product = new Product();
                    product.setName("General " + category.getName());
                    product.setDescription("General waste item for category " + category.getName());
                    product.setCategory(category);
                    product.setClassification(ItemClassification.recyclable);
                    product.setCostStatus(CostStatus.free);
                    product.setHomeOnly(categoryCode.equalsIgnoreCase("FS01") || categoryCode.equalsIgnoreCase("GD01"));
                    product.setCreatedAt(LocalDateTime.now());
                    product = productRepository.save(product);
                }
            }
        }

        if (product != null) {
            QrScan scan = new QrScan();
            scan.setProduct(product);
            scan.setUserSessionId(sessionId);
            scan.setScannedAt(LocalDateTime.now());
            qrScanRepository.save(scan);
        }
    }

    @Transactional
    public Product saveDynamicProduct(HeuristicClassifier.ClassificationResult result, String barcode) {
        try {
            // Avoid duplicate name insert
            Optional<Product> existingProduct = productRepository.findAll().stream()
                .filter(p -> p.getName().equalsIgnoreCase(result.name) || (barcode != null && barcode.equals(p.getBarcode())))
                .findFirst();
            if (existingProduct.isPresent()) {
                return existingProduct.get();
            }

            Optional<Category> categoryOpt = categoryRepository.findByCode(result.categoryCode);
            Category category = categoryOpt.orElseGet(() -> {
                List<Category> all = categoryRepository.findAll();
                return all.isEmpty() ? null : all.get(0);
            });

            if (category == null) {
                return null;
            }

            Product product = new Product();
            product.setName(result.name);
            product.setDescription(result.description);
            product.setCategory(category);
            product.setBarcode(barcode);
            product.setHomeOnly(result.categoryCode.equalsIgnoreCase("FS01") || result.categoryCode.equalsIgnoreCase("GD01"));
            product.setKurukuruLocation("Kurukuru Shop");
            product.setPreparationSteps(result.preparationSteps);
            product.setCreatedAt(LocalDateTime.now());

            try {
                product.setClassification(ItemClassification.fromPgValue(result.classification.toLowerCase()));
            } catch (Exception e) {
                product.setClassification(ItemClassification.recyclable);
            }

            try {
                product.setCostStatus(CostStatus.fromPgValue(result.costStatus.toLowerCase()));
            } catch (Exception e) {
                product.setCostStatus(CostStatus.free);
            }

            return productRepository.save(product);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(SearchService.class).error("Error saving dynamic product to database: ", e);
            return null;
        }
    }

    private String fetchProductFromOpenFoodFacts(String query) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(3))
                    .build();
            String encodedQuery = java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8);
            String url = "https://world.openfoodfacts.org/cgi/search.pl?search_terms=" + encodedQuery + "&search_simple=1&action=process&json=1";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(4))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode products = root.path("products");
                if (products.isArray() && products.size() > 0) {
                    JsonNode first = products.get(0);
                    String name = first.path("product_name_ja").asText(first.path("product_name").asText(""));
                    String packaging = first.path("packaging").asText("");
                    String brands = first.path("brands").asText("");
                    return String.format("Product: %s, Brand: %s, Packaging: %s", name, brands, packaging);
                }
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(SearchService.class).warn("Failed to query Open Food Facts: {}", e.getMessage());
        }
        return null;
    }

    private String fetchFromOpenFoodFactsByBarcode(String barcode) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(3))
                    .build();
            String url = "https://world.openfoodfacts.org/api/v0/product/" + barcode + ".json";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(4))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.path("status").asInt() == 1) {
                    JsonNode product = root.path("product");
                    String name = product.path("product_name_ja").asText(product.path("product_name").asText(""));
                    String packaging = product.path("packaging").asText("");
                    String brands = product.path("brands").asText("");
                    return String.format("Product: %s, Brand: %s, Packaging: %s", name, brands, packaging);
                }
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(SearchService.class).warn("Failed to lookup barcode on Open Food Facts: {}", e.getMessage());
        }
        return null;
    }

    private String fetchFromOpenBeautyFactsByBarcode(String barcode) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(3))
                    .build();
            String url = "https://world.openbeautyfacts.org/api/v0/product/" + barcode + ".json";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(4))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.path("status").asInt() == 1) {
                    JsonNode product = root.path("product");
                    String name = product.path("product_name_ja").asText(product.path("product_name").asText(""));
                    String packaging = product.path("packaging").asText("");
                    String brands = product.path("brands").asText("");
                    return String.format("Product: %s, Brand: %s, Packaging: %s", name, brands, packaging);
                }
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(SearchService.class).warn("Failed to lookup barcode on Open Beauty Facts: {}", e.getMessage());
        }
        return null;
    }

    private String fetchFromOpenProductsFactsByBarcode(String barcode) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(3))
                    .build();
            String url = "https://world.openproductsfacts.org/api/v0/product/" + barcode + ".json";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(4))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.path("status").asInt() == 1) {
                    JsonNode product = root.path("product");
                    String name = product.path("product_name_ja").asText(product.path("product_name").asText(""));
                    String packaging = product.path("packaging").asText("");
                    String brands = product.path("brands").asText("");
                    return String.format("Product: %s, Brand: %s, Packaging: %s", name, brands, packaging);
                }
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(SearchService.class).warn("Failed to lookup barcode on Open Products Facts: {}", e.getMessage());
        }
        return null;
    }

    private ProductDto convertToDto(Product product) {
        return new ProductDto(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getClassification(),
            product.getCostStatus(),
            product.getKurukuruLocation(),
            product.getHomeOnly(),
            product.getPreparationSteps(),
            product.getImageUrl(),
            convertToDto(product.getCategory()),
            product.getCreatedAt()
        );
    }

    private CategoryDto convertToDto(Category category) {
        return new CategoryDto(
            category.getId(),
            category.getCode(),
            category.getName(),
            category.getDescription(),
            category.getDisposalMethod(),
            category.getImageUrl(),
            convertToDto(category.getMainType())
        );
    }

    private MainTypeDto convertToDto(MainType mainType) {
        return new MainTypeDto(
            mainType.getId(),
            mainType.getName(),
            mainType.getIconName(),
            mainType.getColorHex()
        );
    }

    @Autowired
    public SearchService(ProductRepository productRepository,
                         CategoryRepository categoryRepository,
                         MainTypeRepository mainTypeRepository,
                         QrScanRepository qrScanRepository,
                         GeminiClassifier geminiClassifier,
                         HeuristicClassifier heuristicClassifier,
                         ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.mainTypeRepository = mainTypeRepository;
        this.qrScanRepository = qrScanRepository;
        this.geminiClassifier = geminiClassifier;
        this.heuristicClassifier = heuristicClassifier;
        this.objectMapper = objectMapper;
    }
}
