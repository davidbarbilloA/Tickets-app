package com.david.ticket_system.dto;

import java.time.LocalDateTime;

public record TicketHistoryDTO(
        Long id,
        Long ticketId,
        String changedByEmail,
        String changeType,
        String oldValue,
        String newValue,
        LocalDateTime changedAt) {
}
