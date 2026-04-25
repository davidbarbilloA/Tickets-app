package com.david.ticket_system.service;

import com.david.ticket_system.domain.entity.RefreshToken;
import com.david.ticket_system.domain.entity.User;
import com.david.ticket_system.dto.AuthRequest;
import com.david.ticket_system.dto.AuthResponse;
import com.david.ticket_system.dto.RegisterRequest;
import com.david.ticket_system.repository.UserRepository;
import com.david.ticket_system.security.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    public AuthResponse login(AuthRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        String accessToken = jwtService.generateToken(user);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        Cookie cookie = new Cookie("refreshToken", refreshToken.getToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(cookie);

        return new AuthResponse(accessToken, user.getRole().name());
    }

    public void register(RegisterRequest request) {
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .build();

        userRepository.save(user);
    }

    public void logout(HttpServletResponse response, String refreshTokenValue) {

        if (refreshTokenValue != null) {
            userRepository.findAll().stream()
                    .filter(u -> {
                        try {
                            refreshTokenService.validateRefreshToken(refreshTokenValue);
                            return true;
                        } catch (Exception e) {
                            return false;
                        }
                    })
                    .findFirst()
                    .ifPresent(u -> refreshTokenService.revokeByUser(u));
        }

        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}