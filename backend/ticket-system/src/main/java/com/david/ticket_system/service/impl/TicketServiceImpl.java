package com.david.ticket_system.service.impl;

import com.david.ticket_system.domain.entity.Ticket;
import com.david.ticket_system.domain.entity.User;
import com.david.ticket_system.domain.enums.Role;
import com.david.ticket_system.domain.enums.TicketStatus;
import com.david.ticket_system.domain.exception.ResourceNotFoundException;
import com.david.ticket_system.dto.TicketRequestDTO;
import com.david.ticket_system.dto.TicketResponseDTO;
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


    @Override
    public TicketResponseDTO createTicket(TicketRequestDTO request, Authentication authentication) {

        String email = authentication.getName();

        User creator = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuario autenticado no encontrado"));

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

        return mapToResponse(saved);
    }

    @Override
    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private TicketResponseDTO mapToResponse(Ticket ticket) {
        return new TicketResponseDTO(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getCreatedAt()
        );
    }

    @Override
    public TicketResponseDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ticket con id " + id + " no encontrado")
                );

        return mapToResponse(ticket);
    }

    @Override
    public TicketResponseDTO updateTicket(Long id, TicketRequestDTO request){

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ticket con id " + id + " no encontrado")
                );

        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setPriority(request.priority());

        Ticket updated = ticketRepository.save(ticket);

        return mapToResponse(updated);
    }

    @Override
    public void deleteTicket(Long id){
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(()->
                    new ResourceNotFoundException("Ticket con id " + id + " no encontrado" )
                );

        ticketRepository.delete((ticket));
    }

    @Override
    public TicketResponseDTO updateStatus(Long id, TicketStatus status) {

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ticket con id " + id + " no encontrado")
                );

        ticket.setStatus(status);

        Ticket updated = ticketRepository.save(ticket);

        return mapToResponse(updated);
    }
}