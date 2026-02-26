package com.david.ticket_system.service;


import com.david.ticket_system.domain.entity.User;
import com.david.ticket_system.dto.AuthRequest;
import com.david.ticket_system.dto.AuthResponse;
import com.david.ticket_system.dto.RegisterRequest;
import com.david.ticket_system.repository.UserRepository;
import com.david.ticket_system.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(AuthRequest request){
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(()->new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())){
            throw new RuntimeException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(token);
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
}
