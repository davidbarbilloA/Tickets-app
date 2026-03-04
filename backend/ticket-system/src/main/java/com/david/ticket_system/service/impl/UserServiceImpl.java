package com.david.ticket_system.service.impl;

import com.david.ticket_system.domain.entity.User;
import com.david.ticket_system.repository.UserRepository;
import com.david.ticket_system.repository.TicketRepository;
import com.david.ticket_system.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    public UserServiceImpl(UserRepository userRepository,
            TicketRepository ticketRepository) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
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
        List<com.david.ticket_system.domain.entity.Ticket> assigned = ticketRepository.findAll()
                .stream()
                .filter(t -> t.getAssignedTo() != null && t.getAssignedTo().getId().equals(id))
                .toList();

        assigned.forEach(t -> t.setAssignedTo(null));
        ticketRepository.saveAll(assigned);

        // 2. Eliminar tickets creados por el usuario
        List<com.david.ticket_system.domain.entity.Ticket> created = ticketRepository.findAll()
                .stream()
                .filter(t -> t.getCreator() != null && t.getCreator().getId().equals(id))
                .toList();

        ticketRepository.deleteAll(created);

        // 3. Eliminar el usuario
        userRepository.delete(user);
    }
}
