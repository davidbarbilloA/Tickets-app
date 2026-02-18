package com.david.ticket_system.controller;

import com.david.ticket_system.dto.TicketRequestDTO;
import com.david.ticket_system.dto.TicketResponseDTO;
import com.david.ticket_system.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public List<TicketResponseDTO> getAll() {
        return ticketService.getAllTickets();
    }

    @PostMapping
    public TicketResponseDTO create(@RequestBody TicketRequestDTO request) {
        return ticketService.createTicket(request);
    }

    @GetMapping("/{id}")
    public TicketResponseDTO getById(@PathVariable Long id){
        return ticketService.getTicketById(id);
    }
}