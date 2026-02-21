package com.david.ticket_system.service;

import com.david.ticket_system.domain.entity.Ticket;
import com.david.ticket_system.dto.TicketRequest;
import com.david.ticket_system.dto.TicketRequestDTO;
import com.david.ticket_system.dto.TicketResponseDTO;

import java.util.List;

public interface TicketService {

    TicketResponseDTO createTicket(TicketRequestDTO request);

    List<TicketResponseDTO> getAllTickets();

    TicketResponseDTO getTicketById(Long id);

    TicketResponseDTO updateTicket(Long id, TicketRequestDTO request);

    void deleteTicket(Long id);
}
