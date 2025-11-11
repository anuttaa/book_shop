package back.models;

import back.enums.BookType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "books")
public class Book {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  private String author;

  @Column(columnDefinition = "TEXT")
  private String description;

  private String genre;

  private Double price;

  @Enumerated(EnumType.STRING)
  private BookType type;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Transient
  private Double rating;

  @Column(name = "times_added_to_cart")
  private Integer timesAddedToCart = 0;

  @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Media> media;

  @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<CartItem> cartItems;

  @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<OrderItem> orderItems;

  @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Review> reviews;

  @ManyToMany(mappedBy = "books")
  private List<Wishlist> wishlists = new ArrayList<>();

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }

  // Геттер для рейтинга, который вычисляет среднее значение
  public Double getRating() {
    if (this.reviews == null || this.reviews.isEmpty()) {
      return 0.0;
    }

    double sum = this.reviews.stream()
      .mapToInt(Review::getRating)
      .sum();

    return Math.round((sum / this.reviews.size()) * 10.0) / 10.0; // округление до 1 знака
  }

  // Сеттер (может быть пустым или использоваться для установки кэшированного значения)
  public void setRating(Double rating) {
    this.rating = rating;
  }

  // Дополнительный метод для получения количества отзывов
  public Integer getReviewCount() {
    return this.reviews != null ? this.reviews.size() : 0;
  }
}

