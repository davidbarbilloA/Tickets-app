package com.david.ticket_system.service;

import org.springframework.security.core.Authentication;
import com.david.ticket_system.domain.enums.TicketStatus;
import com.david.ticket_system.dto.TicketCommentDTO;
import com.david.ticket_system.dto.TicketHistoryDTO;
import com.david.ticket_system.dto.TicketRequestDTO;
import com.david.ticket_system.dto.TicketResponseDTO;

import java.util.List;

public interface TicketService {

    TicketResponseDTO createTicket(TicketRequestDTO request, Authentication authentication);

    List<TicketResponseDTO> getAllTickets();

    TicketResponseDTO getTicketById(Long id);

    TicketResponseDTO updateTicket(Long id, TicketRequestDTO request);

    void deleteTicket(Long id);

    TicketResponseDTO updateStatus(Long id, TicketStatus status, Authentication authentication);

    // Comentarios
    TicketCommentDTO addComment(Long ticketId, String content, Authentication authentication);

    List<TicketCommentDTO> getComments(Long ticketId);

    // Cambio de técnico
    TicketResponseDTO assignTechnician(Long ticketId, Long technicianId, Authentication authentication);

    // Historial
    List<TicketHistoryDTO> getHistory(Long ticketId);
}
