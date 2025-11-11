package back.controller;

import back.dto.ReviewDTO;
import back.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

  private final ReviewService reviewService;

  // Получить все отзывы по книге
  @GetMapping("/book/{bookId}")
  public ResponseEntity<List<ReviewDTO>> getReviewsByBook(@PathVariable Long bookId) {
    return ResponseEntity.ok(reviewService.getReviewsByBook(bookId));
  }

  // Добавить отзыв
  @PostMapping("/add")
  public ResponseEntity<ReviewDTO> addReview(
    @RequestParam Long userId,
    @RequestParam Long bookId,
    @RequestBody ReviewDTO dto
  ) {
    return ResponseEntity.ok(reviewService.addReview(userId, bookId, dto));
  }

  // Удалить отзыв
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
    reviewService.deleteReview(id);
    return ResponseEntity.noContent().build();
  }
}


