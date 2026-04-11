package com.david.ticket_system.dto;

import com.david.ticket_system.domain.enums.Role;

public record UserResponseDTO(
        Long id,
        String name,
        String email,
        Role role
) {}
