package com.kamikatsu.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

@Service
public class GeminiClassifier {
    private static final Logger log = LoggerFactory.getLogger(GeminiClassifier.class);

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiClassifier(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public HeuristicClassifier.ClassificationResult classify(String query, String extraContext) {
        if (apiKey == null || apiKey.isBlank()) {
            log.info("Gemini API key is not configured. Skipping Gemini classification.");
            return null;
        }

        try {
            String prompt = createPrompt(query, extraContext);

            // Construct the payload for Gemini API
            Map<String, Object> payload = Map.of(
                "contents", java.util.List.of(
                    Map.of("parts", java.util.List.of(
                        Map.of("text", prompt)
                    ))
                ),
                "generationConfig", Map.of(
                    "responseMimeType", "application/json"
                )
            );

            String requestBody = objectMapper.writeValueAsString(payload);

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Gemini API request failed with status code: {}. Body: {}", response.statusCode(), response.body());
                return null;
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode candidate = root.path("candidates").path(0);
            String textResponse = candidate.path("content").path("parts").path(0).path("text").asText();

            if (textResponse == null || textResponse.isBlank()) {
                log.warn("Gemini API returned an empty response.");
                return null;
            }

            // Parse the generated JSON response
            JsonNode classificationJson = objectMapper.readTree(textResponse.trim());
            String name = classificationJson.path("name").asText(query);
            String description = classificationJson.path("description").asText("");
            String categoryCode = classificationJson.path("categoryCode").asText("PL02");
            String classification = classificationJson.path("classification").asText("recyclable");
            String costStatus = classificationJson.path("costStatus").asText("free");
            String preparationSteps = classificationJson.path("preparationSteps").asText("Separate and clean before disposal.");

            return new HeuristicClassifier.ClassificationResult(
                name,
                description,
                categoryCode,
                classification,
                costStatus,
                preparationSteps
            );

        } catch (Exception e) {
            log.error("Error occurred while classifying query with Gemini: ", e);
            return null;
        }
    }

    public String resolveBarcodeDirectly(String barcode) {
        if (apiKey == null || apiKey.isBlank()) {
            log.info("Gemini API key not configured for direct barcode resolution.");
            return null;
        }
        try {
            String prompt = "You are a barcode to product resolver. Identify the product name, brand, and packaging material for EAN/UPC barcode: '" + barcode + "'. "
                + "If you know the exact product or can search/infer it from your knowledge base (e.g. Japanese JAN codes beginning with 49 or 45, or US UPC codes), reply ONLY with a JSON object in this format:\n"
                + "{\n"
                + "  \"name\": \"Product name (English/Japanese)\",\n"
                + "  \"brand\": \"Brand name\",\n"
                + "  \"packaging\": \"Packaging details (e.g. plastic bottle, steel can, cardboard box, aluminum foil)\"\n"
                + "}\n"
                + "If you have absolutely no idea, return: null";

            Map<String, Object> payload = Map.of(
                "contents", java.util.List.of(
                    Map.of("parts", java.util.List.of(
                        Map.of("text", prompt)
                    ))
                ),
                "generationConfig", Map.of(
                    "responseMimeType", "application/json"
                )
            );

            String requestBody = objectMapper.writeValueAsString(payload);
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                String textResponse = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
                if (textResponse != null && !textResponse.isBlank() && !textResponse.trim().equalsIgnoreCase("null")) {
                    JsonNode productJson = objectMapper.readTree(textResponse.trim());
                    String name = productJson.path("name").asText("");
                    String brand = productJson.path("brand").asText("");
                    String packaging = productJson.path("packaging").asText("");
                    if (!name.isBlank()) {
                        return String.format("Product: %s, Brand: %s, Packaging: %s", name, brand, packaging);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Gemini barcode direct resolution failed: {}", e.getMessage());
        }
        return null;
    }

    private String createPrompt(String query, String extraContext) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are the Kamikatsu Zero-Waste Navigator AI classifier. ")
              .append("Your task is to classify a product or household item into one of the Kamikatsu, Japan waste categories.\n\n")
              .append("The item queried is: '").append(query).append("'\n");

        if (extraContext != null && !extraContext.isBlank()) {
            prompt.append("Extra context about the item: ").append(extraContext).append("\n");
        }

        prompt.append("\nClassify the item into one of the following Kamikatsu category codes:\n")
              .append("- CB01: Cardboard (Flattened cardboard boxes)\n")
              .append("- CB02: Paper (Newspaper, magazine, book, general paper waste)\n")
              .append("- MT01: Steel Cans (Food/beverage steel cans)\n")
              .append("- MT02: Aluminum (Aluminum cans and foil)\n")
              .append("- GL01: Clear Glass (Clear glass bottles)\n")
              .append("- GL02: Colored Glass (Brown, green, colored glass bottles)\n")
              .append("- CR01: Ceramics (Plates, bowls, pottery)\n")
              .append("- CR02: Porcelain (Fine porcelain items)\n")
              .append("- PL01: PET Plastic (Water bottles, soft drink bottles)\n")
              .append("- PL02: HDPE Plastic (Milk jugs, detergent bottles, wrappers, general plastics, bags)\n")
              .append("- RB01: Rubber (Rubber bands, rubber items, tires)\n")
              .append("- LE01: Leather (Leather shoes, jackets, bags)\n")
              .append("- TX01: Cotton Textiles (Cotton clothing, sheets)\n")
              .append("- TX02: Mixed Textiles (Poly/cotton blends, general clothing)\n")
              .append("- PD01: Pamphlets (Flyers, brochures, small paper advertisements)\n")
              .append("- WD01: Wood Scraps (Small wood pieces, bamboo, sticks)\n")
              .append("- GD01: Leaves & Branches (Garden vegetation, grass, leaves)\n")
              .append("- FS01: Food Waste (Vegetable scraps, leftovers, raw organic food waste)\n\n")
              .append("Return the response ONLY as a single JSON object. Do not include markdown code block formatting (like ```json). ")
              .append("The JSON MUST match this structure exactly:\n")
              .append("{\n")
              .append("  \"name\": \"Clear bilingual name (e.g. Coca-Cola PET Bottle / コカコーラ ペットボトル)\",\n")
              .append("  \"description\": \"Brief bilingual description (e.g. Plastic bottle from soft drink / 炭酸飲料のプラスチック製ボトル)\",\n")
              .append("  \"categoryCode\": \"A code from the list above (e.g. PL01)\",\n")
              .append("  \"classification\": \"One of: recyclable, compostable, reusable, hazardous\",\n")
              .append("  \"costStatus\": \"One of: free, paid, donation\",\n")
              .append("  \"preparationSteps\": \"Numbered preparation instructions according to standard Japanese recycling (e.g. 1. Rinse inside. 2. Remove cap and label. 3. Flatten bottle.)\"\n")
              .append("}");

        return prompt.toString();
    }
}
