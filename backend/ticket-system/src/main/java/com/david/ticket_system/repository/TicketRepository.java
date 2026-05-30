package com.david.ticket_system.repository;

import com.david.ticket_system.domain.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Page<Ticket> findByCreatorEmail(String creatorEmail, Pageable pageable);

    Page<Ticket> findByAssignedToEmail(String assignedToEmail, Pageable pageable);
}
