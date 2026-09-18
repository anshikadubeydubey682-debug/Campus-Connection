package com.campusconnect.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "doubt_replies")
public class DoubtReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(columnDefinition = "TEXT")
    private String textExplanation;
    
    private String mediaUrl; // For uploaded photo or video
    private String mediaType; // "IMAGE", "VIDEO", or null
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doubt_id", nullable = false)
    private Doubt doubt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public DoubtReply() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTextExplanation() { return textExplanation; }
    public void setTextExplanation(String textExplanation) { this.textExplanation = textExplanation; }
    
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    
    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }
    
    public Doubt getDoubt() { return doubt; }
    public void setDoubt(Doubt doubt) { this.doubt = doubt; }
    
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
