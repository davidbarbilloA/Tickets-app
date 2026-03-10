package com.david.ticket_system.service;

import com.david.ticket_system.domain.entity.User;
import java.util.List;

public interface UserService {

    User createUser(User user);

    List<User> getAllUsers();

    List<User> getTechnicians();

    User getUserById(Long id);

    User updateUser(Long id, User user);

    void deleteUser(Long id);
}
