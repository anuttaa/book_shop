package back.controller;

import back.dto.ReviewDTO;
import back.models.User;
import back.service.ReviewService;
import back.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

  private final ReviewService reviewService;
  private final UserService userService;

  @GetMapping("/book/{bookId}")
  public ResponseEntity<List<ReviewDTO>> getReviewsByBook(@PathVariable Long bookId) {
    return ResponseEntity.ok(reviewService.getReviewsByBook(bookId));
  }

  @PostMapping
  public ResponseEntity<ReviewDTO> createReview(
    @RequestParam Long bookId,
    @RequestBody ReviewDTO dto,
    Authentication authentication
  ) {
    if (authentication == null) {
      return ResponseEntity.status(401).build();
    }

    String username = authentication.getName();
    User user = userService.getUserEntityByUsername(username);

    return ResponseEntity.ok(reviewService.addReview(user.getId(), bookId, dto));
  }

  @GetMapping("/my")
  public ResponseEntity<List<ReviewDTO>> getMyReviews() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    System.out.println("=== /api/reviews/my called ===");
    System.out.println("SecurityContext auth: " + authentication);

    if (authentication == null || !authentication.isAuthenticated() ||
      "anonymousUser".equals(authentication.getPrincipal())) {
      System.out.println("User not authenticated");
      return ResponseEntity.status(401).build();
    }

    String username = authentication.getName();
    System.out.println("Username: " + username);

    User user = userService.getUserEntityByUsername(username);
    return ResponseEntity.ok(reviewService.getReviewsByUser(user.getId()));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ReviewDTO> updateReview(
    @PathVariable Long id,
    @RequestBody ReviewDTO dto,
    Authentication authentication
  ) {
    if (authentication == null) {
      return ResponseEntity.status(401).build();
    }

    String username = authentication.getName();
    User user = userService.getUserEntityByUsername(username);

    return ResponseEntity.ok(reviewService.updateReview(id, user.getId(), dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteReview(
    @PathVariable Long id,
    Authentication authentication
  ) {
    if (authentication == null) {
      return ResponseEntity.status(401).build();
    }

    String username = authentication.getName();
    User user = userService.getUserEntityByUsername(username);

    reviewService.deleteReview(id, user.getId());
    return ResponseEntity.noContent().build();
  }
}


