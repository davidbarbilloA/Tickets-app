package com.david.ticket_system.dto;

import com.david.ticket_system.domain.enums.Role;

public record RegisterRequest(
        String name,
        String email,
        String password,
        Role role
) {}
