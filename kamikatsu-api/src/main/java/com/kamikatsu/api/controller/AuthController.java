package com.kamikatsu.api.controller;

import com.kamikatsu.api.dto.AuthRequest;
import com.kamikatsu.api.dto.AuthResponse;
import com.kamikatsu.api.entity.User;
import com.kamikatsu.api.repository.UserRepository;
import com.kamikatsu.api.service.EmailService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (request.getEmail() == null || request.getPassword() == null || request.getName() == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email is already registered");
        }

        String hashedPassword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt());

        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPasswordHash(hashedPassword);
        user.setPoints(0);

        userRepository.save(user);

        // Send Welcome Email asynchronously
        new Thread(() -> emailService.sendWelcomeEmail(user.getEmail(), user.getName())).start();

        // Use the user ID as a mock session token for beta
        String token = String.valueOf(user.getId());
        
        AuthResponse response = new AuthResponse(user.getId(), user.getEmail(), user.getName(), user.getPoints(), token);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body("Missing email or password");
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        User user = userOpt.get();
        if (!BCrypt.checkpw(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        String token = String.valueOf(user.getId());
        AuthResponse response = new AuthResponse(user.getId(), user.getEmail(), user.getName(), user.getPoints(), token);
        
        return ResponseEntity.ok(response);
    }
}
