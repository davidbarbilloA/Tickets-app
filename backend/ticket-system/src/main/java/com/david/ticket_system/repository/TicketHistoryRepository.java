package com.david.ticket_system.repository;

import com.david.ticket_system.domain.entity.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {
    List<TicketHistory> findByTicketIdOrderByChangedAtDesc(Long ticketId);

    List<TicketHistory> findByChangedById(Long changedById);
}
