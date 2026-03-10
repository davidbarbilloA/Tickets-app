package com.david.ticket_system.dto;

import java.time.LocalDateTime;

public record TicketCommentDTO(
        Long id,
        Long ticketId,
        String authorEmail,
        String content,
        LocalDateTime createdAt) {
}
