package back.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "wishlist")
public class Wishlist {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToMany
  @JoinTable(
    name = "wishlist_books",
    joinColumns = @JoinColumn(name = "wishlist_id"),
    inverseJoinColumns = @JoinColumn(name = "book_id")
  )
  private List<Book> books = new ArrayList<>();

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() { createdAt = LocalDateTime.now(); }

  public void addBook(Book book) {
    this.books.add(book);
    book.getWishlists().add(this);
  }

  public void removeBook(Book book) {
    this.books.remove(book);
    book.getWishlists().remove(this);
  }
}


