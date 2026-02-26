package com.david.ticket_system.dto;
import com.david.ticket_system.domain.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TicketRequestDTO(


        @NotBlank(message = "El título es obligatorio")
        String title,

        @NotBlank(message = "La descripción es obligatoria")
        String description,

        @NotNull(message = "La prioridad es obligatoria")
        TicketPriority priority

) {}
