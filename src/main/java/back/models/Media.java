package back.models;

import back.enums.FileType;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "media")
public class Media {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "book_id")
  @JsonBackReference
  private Book book;

  @OneToOne(mappedBy = "avatarMedia", fetch = FetchType.EAGER)
  @JsonIgnore
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(name = "file_type")
  private FileType fileType;

  @Column(name = "file_name")
  private String fileName;

  @Lob
  @Column(name = "file_url")
  private String fileUrl;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() { createdAt = LocalDateTime.now(); }
}