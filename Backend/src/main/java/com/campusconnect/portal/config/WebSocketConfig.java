package com.campusconnect.portal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // These are endpoints the client can subscribe to.
        config.enableSimpleBroker("/topic", "/queue");
        
        // This is the prefix for endpoints the client will send messages to.
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // This is the endpoint the client will use to connect to the WebSocket server
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Allows cross-origin requests
                .withSockJS(); // Enable SockJS fallback options
    }
}
