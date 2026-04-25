package com.david.ticket_system.controller;

import com.david.ticket_system.domain.entity.RefreshToken;
import com.david.ticket_system.domain.entity.User;
import com.david.ticket_system.dto.AuthRequest;
import com.david.ticket_system.dto.AuthResponse;
import com.david.ticket_system.dto.RegisterRequest;
import com.david.ticket_system.security.JwtService;
import com.david.ticket_system.service.AuthService;
import com.david.ticket_system.service.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody AuthRequest request,
            HttpServletResponse response) {
        return ResponseEntity.ok(authService.login(request, response));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("Usuario creado correctamente");
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        // Extraer el refresh token de la cookie
        String refreshTokenValue = Arrays.stream(
                        request.getCookies() != null ? request.getCookies() : new Cookie[0])
                .filter(c -> "refreshToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Refresh token no encontrado"));

        // Validar y obtener el usuario
        RefreshToken refreshToken = refreshTokenService.validateRefreshToken(refreshTokenValue);
        User user = refreshToken.getUser();

        // Generar nuevo access token
        String newAccessToken = jwtService.generateToken(user);

        return ResponseEntity.ok(new AuthResponse(newAccessToken, user.getRole().name()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        String refreshTokenValue = Arrays.stream(
                        request.getCookies() != null ? request.getCookies() : new Cookie[0])
                .filter(c -> "refreshToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);

        authService.logout(response, refreshTokenValue);
        return ResponseEntity.noContent().build();
    }
}