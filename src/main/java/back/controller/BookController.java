package back.controller;

import back.dto.BookDTO;
import back.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

  private final BookService bookService;

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
  public ResponseEntity<List<BookDTO>> getRecommendedBooks() {
    return ResponseEntity.ok(bookService.getRecommendedBooks());
  }

  @GetMapping("/popular")
  public ResponseEntity<List<BookDTO>> getPopularBooks() {
    return ResponseEntity.ok(bookService.getPopularBooks());
  }
}

