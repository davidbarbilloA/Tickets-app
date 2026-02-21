package com.david.ticket_system.service.impl;

import com.david.ticket_system.domain.entity.Ticket;
import com.david.ticket_system.domain.entity.User;
import com.david.ticket_system.domain.enums.TicketPriority;
import com.david.ticket_system.domain.enums.TicketStatus;
import com.david.ticket_system.domain.exception.ResourceNotFoundException;
import com.david.ticket_system.dto.TicketRequest;
import com.david.ticket_system.dto.TicketRequestDTO;
import com.david.ticket_system.dto.TicketResponseDTO;
import com.david.ticket_system.repository.TicketRepository;
import com.david.ticket_system.repository.UserRepository;
import com.david.ticket_system.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;


    @Override
    public TicketResponseDTO createTicket(TicketRequestDTO request) {

        User creator = userRepository.findById(request.creatorId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuario creador no encontrado"));

        User assigned = null;

        if (request.assignedToId() != null) {
            assigned = userRepository.findById(request.assignedToId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Usuario asignado no encontrado"));
        }

        Ticket ticket = Ticket.builder()
                .title(request.title())
                .description(request.description())
                .status(TicketStatus.OPEN)
                .priority(request.priority()) // si ya es enum
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
//    @Override
//    public Ticket create(TicketRequest request) {
//
//        User creator = userRepository.findById(request.getCreatorId())
//                .orElseThrow(() -> new RuntimeException("Creator not found"));
//
//        User assigned = null;
//
//        if (request.getAssignedToId() != null) {
//            assigned = userRepository.findById(request.getAssignedToId())
//                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
//        }
//
//        Ticket ticket = new Ticket();
//        ticket.setTitle(request.getTitle());
//        ticket.setDescription(request.getDescription());
//        ticket.setStatus(TicketStatus.valueOf(request.getStatus()));
//        ticket.setPriority(request.getPriority());
//        ticket.setCreator(creator);
//        ticket.setAssignedTo(assigned);
//
//        return ticketRepository.save(ticket);
//    }
}