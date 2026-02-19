package com.david.ticket_system.controller;

import com.david.ticket_system.dto.TicketRequestDTO;
import com.david.ticket_system.dto.TicketResponseDTO;
import com.david.ticket_system.service.TicketService;
import jakarta.validation.Valid;
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

//    @PostMapping
//    public TicketResponseDTO create(@RequestBody TicketRequestDTO request) {
//        return ticketService.createTicket(request);
//    }

    @GetMapping("/{id}")
    public TicketResponseDTO getById(@PathVariable Long id){
        return ticketService.getTicketById(id);
    }

    @PostMapping
    public ResponseEntity<TicketResponseDTO> create(
            @Valid @RequestBody TicketRequestDTO request){
        TicketResponseDTO response = ticketService.createTicket(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody TicketRequestDTO request){

        TicketResponseDTO response = ticketService.updateTicket(id, request);

        return  ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        ticketService.deleteTicket(id);

        return ResponseEntity.noContent().build();
    }
}