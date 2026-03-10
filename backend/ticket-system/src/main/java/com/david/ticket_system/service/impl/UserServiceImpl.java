package com.david.ticket_system.service.impl;

import com.david.ticket_system.domain.entity.Ticket;
import com.david.ticket_system.domain.entity.User;
import com.david.ticket_system.domain.enums.Role;
import com.david.ticket_system.repository.TicketCommentRepository;
import com.david.ticket_system.repository.TicketHistoryRepository;
import com.david.ticket_system.repository.TicketRepository;
import com.david.ticket_system.repository.UserRepository;
import com.david.ticket_system.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketHistoryRepository historyRepository;

    public UserServiceImpl(UserRepository userRepository,
            TicketRepository ticketRepository,
            TicketCommentRepository commentRepository,
            TicketHistoryRepository historyRepository) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.historyRepository = historyRepository;
    }

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> getTechnicians() {
        return userRepository.findByRole(Role.TECH);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User updateUser(Long id, User user) {
        User existingUser = getUserById(id);
        existingUser.setName(user.getName());
        existingUser.setEmail(user.getEmail());
        existingUser.setPassword(user.getPassword());
        existingUser.setRole(user.getRole());
        return userRepository.save(existingUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 1. Desvincular tickets donde el usuario es el técnico asignado
        List<Ticket> assigned = ticketRepository.findAll()
                .stream()
                .filter(t -> t.getAssignedTo() != null && t.getAssignedTo().getId().equals(id))
                .toList();
        assigned.forEach(t -> t.setAssignedTo(null));
        ticketRepository.saveAll(assigned);

        // 2. Obtener tickets creados por el usuario
        List<Ticket> created = ticketRepository.findAll()
                .stream()
                .filter(t -> t.getCreator() != null && t.getCreator().getId().equals(id))
                .toList();

        // 3. Borrar comentarios e historial de los tickets que se van a eliminar
        for (Ticket ticket : created) {
            commentRepository.deleteAll(commentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId()));
            historyRepository.deleteAll(historyRepository.findByTicketIdOrderByChangedAtDesc(ticket.getId()));
        }

        // 4. Borrar comentarios hechos por el usuario (como autor)
        commentRepository.deleteAll(commentRepository.findByAuthorId(id));

        // 5. Borrar entradas de historial donde el usuario fue quien realizó el cambio
        historyRepository.deleteAll(historyRepository.findByChangedById(id));

        // 6. Eliminar tickets creados por el usuario
        ticketRepository.deleteAll(created);

        // 7. Eliminar el usuario
        userRepository.delete(user);
    }
}
