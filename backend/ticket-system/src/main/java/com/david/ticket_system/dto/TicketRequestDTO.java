package com.david.ticket_system.dto;

import com.david.ticket_system.domain.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TicketRequestDTO(

        @NotBlank(message = "El titulo es obligatorio")
        @Size(min = 3, max = 255, message = "El  titulo debe tener entre 3 y 255 caracteres")
        String title,
        @NotBlank(message = "La descripción es obligatoria")
        @Size(min = 5, max = 1000, message = "La descripción debe tener entre 5 y 1000 caracteres")
        String description,
        TicketPriority priority,
        Long creatorId,
        Long assignedToId

) {}
