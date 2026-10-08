package com.campusconnect.portal.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // This method handles messages sent from the client to /app/sendNotification
    // and broadcasts them to all subscribers of /topic/public
    @MessageMapping("/sendNotification")
    @SendTo("/topic/public")
    public String broadcastNotification(@Payload String message) {
        return message;
    }

    // You can also send a notification programmatically from anywhere in your backend
    // using a REST endpoint for testing
    @PostMapping("/send")
    public String sendNotificationViaRest(@RequestBody String message) {
        // Send the message to a specific topic
        messagingTemplate.convertAndSend("/topic/public", message);
        return "Notification sent successfully";
    }
}
