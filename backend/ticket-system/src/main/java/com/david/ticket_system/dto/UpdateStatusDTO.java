package com.david.ticket_system.dto;

import com.david.ticket_system.domain.enums.TicketStatus;

public record UpdateStatusDTO(
        TicketStatus status
) {}
