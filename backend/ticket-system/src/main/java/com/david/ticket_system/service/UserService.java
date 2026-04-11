package com.david.ticket_system.service;

import com.david.ticket_system.domain.entity.User;
import com.david.ticket_system.dto.UserResponseDTO;

import java.util.List;

public interface UserService {

    UserResponseDTO createUser(User user);

    List<UserResponseDTO> getAllUsers();

    List<UserResponseDTO> getTechnicians();

    UserResponseDTO getUserById(Long id);

    User updateUser(Long id, User user);

    void deleteUser(Long id);
}
