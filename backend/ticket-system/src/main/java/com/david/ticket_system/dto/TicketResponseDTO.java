package com.david.ticket_system.dto;

import com.david.ticket_system.domain.enums.TicketStatus;

import java.time.LocalDateTime;

public record TicketResponseDTO(
        long id,
        String title,
        String description,
        TicketStatus status,
        LocalDateTime createdAt
) {}
