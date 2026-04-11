package com.david.ticket_system.controller;

import com.david.ticket_system.domain.entity.User;
import com.david.ticket_system.dto.UserResponseDTO;
import com.david.ticket_system.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Crear usuario
    @PostMapping
    public UserResponseDTO createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    // Listar todos
    @GetMapping
    public List<UserResponseDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    // Listar solo técnicos
    @GetMapping("/technicians")
    public List<UserResponseDTO> getTechnicians() {
        return userService.getTechnicians();
    }

    // Obtener por id
    @GetMapping("/{id}")
    public UserResponseDTO getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // Actualizar
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    // Eliminar
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @GetMapping("/api/test")
    public String test(Authentication authentication) {
        return "Usuario autenticado: " + authentication.getName();
    }
}