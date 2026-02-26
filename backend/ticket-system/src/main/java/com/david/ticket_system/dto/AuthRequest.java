package com.david.ticket_system.dto;

public record AuthRequest(
        String email,
        String password
) {}
