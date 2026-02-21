package com.david.ticket_system.dto;

import com.david.ticket_system.domain.enums.TicketPriority;

public class TicketRequest {
    private String title;
    private String description;
    private String status;
    private TicketPriority priority;
    private Long creatorId;
    private Long assignedToId;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = TicketPriority.valueOf(priority);
    }

    public Long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(Long creatorId) {
        this.creatorId = creatorId;
    }

    public Long getAssignedToId() {
        return assignedToId;
    }

    public void setAssignedToId(Long assignedToId) {
        this.assignedToId = assignedToId;
    }
}
