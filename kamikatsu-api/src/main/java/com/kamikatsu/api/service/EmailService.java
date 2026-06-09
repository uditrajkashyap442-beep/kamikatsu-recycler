package com.kamikatsu.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Value("${resend.api.key:re_eszNE9qd_G3WPieAmEfvWfCkJwBn45ETg}") // Use provided key as default fallback
    private String resendApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    public void sendWelcomeEmail(String toEmail, String name) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            System.out.println("RESEND_API_KEY is missing. Mocking Welcome Email to: " + toEmail);
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("from", "Kamikatsu Zero-Waste <onboarding@resend.dev>");
            body.put("to", List.of(toEmail));
            body.put("subject", "Welcome to Kamikatsu Navigator, " + name + "! ♻️");
            
            String htmlContent = """
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2F855A;">Welcome to Kamikatsu, %s!</h2>
                    <p>We are thrilled to have you join our zero-waste community.</p>
                    <p>With the <strong>Kamikatsu Navigator</strong> app, you can:</p>
                    <ul>
                        <li>🔍 Search over 100+ waste categories to see exactly where to dispose of items.</li>
                        <li>🤖 Use our state-of-the-art AI to identify complex items.</li>
                        <li>📱 Scan QR codes at the waste station to earn Chiri-Tsumo points!</li>
                    </ul>
                    <p>Let's make zero waste a reality together.</p>
                    <br>
                    <p style="color: #666; font-size: 12px;">The Kamikatsu Zero-Waste Team</p>
                </div>
                """.formatted(name);
            
            body.put("html", htmlContent);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            restTemplate.postForObject(RESEND_API_URL, request, String.class);
            System.out.println("Welcome email successfully sent via Resend to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }
}
