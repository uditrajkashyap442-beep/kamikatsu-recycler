package com.kamikatsu.api.dto;

public class AuthResponse {
    private Long id;
    private String email;
    private String name;
    private int points;
    private String token; // We'll just return the user ID as a mock token for now

    public AuthResponse(Long id, String email, String name, int points, String token) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.points = points;
        this.token = token;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public int getPoints() { return points; }
    public String getToken() { return token; }
}
