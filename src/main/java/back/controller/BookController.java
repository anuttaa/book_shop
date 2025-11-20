package back.controller;

import back.dto.BookDTO;
import back.models.User;
import back.service.BookService;
import back.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

  private final BookService bookService;
  private final UserService userService;

  @GetMapping
  public ResponseEntity<List<BookDTO>> getAllBooks() {
    return ResponseEntity.ok(bookService.getAllBooks());
  }

  @GetMapping("/{id}")
  public ResponseEntity<BookDTO> getBookById(@PathVariable Long id) {
    return ResponseEntity.ok(bookService.getBookById(id));
  }

  @GetMapping("/search")
  public ResponseEntity<List<BookDTO>> searchBooks(
    @RequestParam(required = false) String title,
    @RequestParam(required = false) String author,
    @RequestParam(required = false) String genre) {
    return ResponseEntity.ok(bookService.searchBooks(title, author, genre));
  }

  @PostMapping
  public ResponseEntity<BookDTO> createBook(@RequestBody BookDTO dto) {
    return ResponseEntity.ok(bookService.createBook(dto));
  }

  @PutMapping("/{id}")
  public ResponseEntity<BookDTO> updateBook(@PathVariable Long id, @RequestBody BookDTO dto) {
    return ResponseEntity.ok(bookService.updateBook(id, dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
    bookService.deleteBook(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/recommended")
  public ResponseEntity<List<BookDTO>> getRecommendedBooks(Authentication authentication) {
    User user = null;
    if (authentication != null) {
      try {
        user = userService.getUserEntityByUsername(authentication.getName());
      } catch (RuntimeException e) {
        System.out.println("User not found, using default recommendations: " + e.getMessage());
      }
    }

    List<BookDTO> recommendations = bookService.getRecommendedBooks(user);

    if (user != null) {
      System.out.println("Personalized recommendations for user: " + user.getUsername());
    } else {
      System.out.println("Default recommendations for guest user");
    }

    return ResponseEntity.ok(recommendations);
  }

  @GetMapping("/popular")
  public ResponseEntity<List<BookDTO>> getPopularBooks(Authentication authentication) {
    User user = null;
    if (authentication != null) {
      try {
        user = userService.getUserEntityByUsername(authentication.getName());
      } catch (RuntimeException e) {
        System.out.println("User not found, using default popular books: " + e.getMessage());
      }
    }
    return ResponseEntity.ok(bookService.getPopularBooks(user));
  }

  @GetMapping("/top-rated")
  public ResponseEntity<List<BookDTO>> getTopRatedBooks() {
    return ResponseEntity.ok(bookService.getTopRatedBooks());
  }

  @GetMapping("/genre/{genre}")
  public ResponseEntity<List<BookDTO>> getBooksByGenre(@PathVariable String genre) {
    List<BookDTO> books = bookService.getAllBooks().stream()
      .filter(book -> book.getGenre() != null && book.getGenre().equalsIgnoreCase(genre))
      .collect(java.util.stream.Collectors.toList());
    return ResponseEntity.ok(books);
  }

  @GetMapping("/new-arrivals")
  public ResponseEntity<List<BookDTO>> getNewArrivals() {
    List<BookDTO> newArrivals = bookService.getRecommendedBooks(null);
    return ResponseEntity.ok(newArrivals);
  }
}