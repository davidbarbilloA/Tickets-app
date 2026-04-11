package com.david.ticket_system.service.impl;

import com.david.ticket_system.domain.entity.Ticket;
import com.david.ticket_system.domain.entity.TicketComment;
import com.david.ticket_system.domain.entity.TicketHistory;
import com.david.ticket_system.domain.entity.User;
import com.david.ticket_system.domain.enums.Role;
import com.david.ticket_system.domain.enums.TicketStatus;
import com.david.ticket_system.domain.exception.ResourceNotFoundException;
import com.david.ticket_system.dto.TicketCommentDTO;
import com.david.ticket_system.dto.TicketHistoryDTO;
import com.david.ticket_system.dto.TicketRequestDTO;
import com.david.ticket_system.dto.TicketResponseDTO;
import com.david.ticket_system.mapper.TicketMapper;
import com.david.ticket_system.repository.TicketCommentRepository;
import com.david.ticket_system.repository.TicketHistoryRepository;
import com.david.ticket_system.repository.TicketRepository;
import com.david.ticket_system.repository.UserRepository;
import com.david.ticket_system.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

        private final TicketRepository ticketRepository;
        private final UserRepository userRepository;
        private final TicketCommentRepository commentRepository;
        private final TicketHistoryRepository historyRepository;
        private final TicketMapper ticketMapper;

        @Override
        public TicketResponseDTO createTicket(TicketRequestDTO request, Authentication authentication) {

                String email = authentication.getName();

                User creator = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));

                // Buscar técnicos
                List<User> technicians = userRepository.findByRole(Role.TECH);

                if (technicians.isEmpty()) {
                        throw new RuntimeException("No hay técnicos disponibles");
                }

                // Asignar técnico aleatorio
                Random random = new Random();
                User assigned = technicians.get(random.nextInt(technicians.size()));

                Ticket ticket = Ticket.builder()
                                .title(request.title())
                                .description(request.description())
                                .status(TicketStatus.OPEN)
                                .priority(request.priority())
                                .creator(creator)
                                .assignedTo(assigned)
                                .build();

                Ticket saved = ticketRepository.save(ticket);

                return ticketMapper.toDTO(saved);
        }

        @Override
        public List<TicketResponseDTO> getAllTickets() {
                return ticketRepository.findAll()
                                .stream()
                                .map(ticketMapper::toDTO)
                                .toList();
        }

        @Override
        public TicketResponseDTO getTicketById(Long id) {
                Ticket ticket = ticketRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Ticket con id " + id + " no encontrado"));

                return ticketMapper.toDTO(ticket);
        }

        @Override
        public TicketResponseDTO updateTicket(Long id, TicketRequestDTO request) {

                Ticket ticket = ticketRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Ticket con id " + id + " no encontrado"));

                ticket.setTitle(request.title());
                ticket.setDescription(request.description());
                ticket.setPriority(request.priority());

                Ticket updated = ticketRepository.save(ticket);

                return ticketMapper.toDTO(updated);
        }

        @Override
        @org.springframework.transaction.annotation.Transactional
        public void deleteTicket(Long id) {
                Ticket ticket = ticketRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Ticket con id " + id + " no encontrado"));

                // Borrar comentarios e historial antes de borrar el ticket
                commentRepository.deleteAll(commentRepository.findByTicketIdOrderByCreatedAtAsc(id));
                historyRepository.deleteAll(historyRepository.findByTicketIdOrderByChangedAtDesc(id));

                ticketRepository.delete(ticket);
        }

        @Override
        public TicketResponseDTO updateStatus(Long id, TicketStatus status, Authentication authentication) {

                Ticket ticket = ticketRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Ticket con id " + id + " no encontrado"));

                String oldStatus = ticket.getStatus().name();
                ticket.setStatus(status);
                Ticket updated = ticketRepository.save(ticket);

                // Guardar historial del cambio de estado (no bloquea si falla)
                try {
                        if (authentication != null) {
                                User changedBy = userRepository.findByEmail(authentication.getName()).orElse(null);
                                if (changedBy != null) {
                                        TicketHistory history = TicketHistory.builder()
                                                        .ticket(updated)
                                                        .changedBy(changedBy)
                                                        .changeType("STATUS_CHANGE")
                                                        .oldValue(oldStatus)
                                                        .newValue(status.name())
                                                        .build();
                                        historyRepository.save(history);
                                }
                        }
                } catch (Exception e) {
                        // El fallo del historial no debe revertir el cambio de estado
                        System.err.println("Advertencia: no se pudo guardar el historial de estado: " + e.getMessage());
                }

                return ticketMapper.toDTO(updated);
        }

        // ─── Comentarios ──────────────────────────────────────────────────────────

        @Override
        public TicketCommentDTO addComment(Long ticketId, String content, Authentication authentication) {

                Ticket ticket = ticketRepository.findById(ticketId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Ticket con id " + ticketId + " no encontrado"));

                User author = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

                TicketComment commentObj = TicketComment.builder()
                                .ticket(ticket)
                                .author(author)
                                .content(content)// Llenamos ambas para evitar el constraint error en base de datos
                                .build();

                TicketComment saved = commentRepository.save(commentObj);

                return mapToCommentDTO(saved);
        }

        @Override
        public List<TicketCommentDTO> getComments(Long ticketId) {
                return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                                .stream()
                                .map(this::mapToCommentDTO)
                                .toList();
        }

        private TicketCommentDTO mapToCommentDTO(TicketComment comment) {
                return new TicketCommentDTO(
                                comment.getId(),
                                comment.getTicket().getId(),
                                comment.getAuthor().getEmail(),
                                comment.getContent(),
                                comment.getCreatedAt());
        }

        // ─── Cambio de técnico ────────────────────────────────────────────────────

        @Override
        public TicketResponseDTO assignTechnician(Long ticketId, Long technicianId, Authentication authentication) {

                Ticket ticket = ticketRepository.findById(ticketId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Ticket con id " + ticketId + " no encontrado"));

                User newTech = userRepository.findById(technicianId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Técnico con id " + technicianId + " no encontrado"));

                if (newTech.getRole() != Role.TECH) {
                        throw new RuntimeException("El usuario seleccionado no es un técnico");
                }

                String oldTech = ticket.getAssignedTo() != null ? ticket.getAssignedTo().getEmail() : "Sin asignar";

                ticket.setAssignedTo(newTech);
                Ticket updated = ticketRepository.save(ticket);

                // Guardar historial del cambio de técnico (no bloquea si falla)
                try {
                        if (authentication != null) {
                                User changedBy = userRepository.findByEmail(authentication.getName()).orElse(null);
                                if (changedBy != null) {
                                        TicketHistory history = TicketHistory.builder()
                                                        .ticket(updated)
                                                        .changedBy(changedBy)
                                                        .changeType("TECHNICIAN_CHANGE")
                                                        .oldValue(oldTech)
                                                        .newValue(newTech.getEmail())
                                                        .build();
                                        historyRepository.save(history);
                                }
                        }
                } catch (Exception e) {
                        System.err.println(
                                        "Advertencia: no se pudo guardar el historial de técnico: " + e.getMessage());
                }

                return ticketMapper.toDTO(updated);
        }

        // ─── Historial ────────────────────────────────────────────────────────────

        @Override
        public List<TicketHistoryDTO> getHistory(Long ticketId) {
                return historyRepository.findByTicketIdOrderByChangedAtDesc(ticketId)
                                .stream()
                                .map(h -> new TicketHistoryDTO(
                                                h.getId(),
                                                h.getTicket().getId(),
                                                h.getChangedBy().getEmail(),
                                                h.getChangeType(),
                                                h.getOldValue(),
                                                h.getNewValue(),
                                                h.getChangedAt()))
                                .toList();
        }
}