package com.david.ticket_system.mapper;

import com.david.ticket_system.domain.entity.Ticket;
import com.david.ticket_system.dto.TicketResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class TicketMapper {

    public TicketResponseDTO toDTO(Ticket ticket) {
        return new TicketResponseDTO(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getCreatedAt(),
                ticket.getCreator() != null ? ticket.getCreator().getEmail() : null,
                ticket.getAssignedTo() != null ? ticket.getAssignedTo().getEmail() : null
        );
    }
}
