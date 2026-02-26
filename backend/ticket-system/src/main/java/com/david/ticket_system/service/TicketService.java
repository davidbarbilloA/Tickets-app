package com.david.ticket_system.service;

import org.springframework.security.core.Authentication;
import com.david.ticket_system.domain.enums.TicketStatus;
import com.david.ticket_system.dto.TicketRequestDTO;
import com.david.ticket_system.dto.TicketResponseDTO;

import java.util.List;

public interface TicketService {

    TicketResponseDTO createTicket(TicketRequestDTO request, Authentication authentication);

    List<TicketResponseDTO> getAllTickets();

    TicketResponseDTO getTicketById(Long id);

    TicketResponseDTO updateTicket(Long id, TicketRequestDTO request);

    void deleteTicket(Long id);

    TicketResponseDTO updateStatus(Long id, TicketStatus status);
}
