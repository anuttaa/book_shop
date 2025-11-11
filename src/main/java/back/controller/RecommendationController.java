package back.controller;

import back.dto.BookDTO;
import back.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

  private final RecommendationService recommendationService;

  @GetMapping("/{userId}")
  public ResponseEntity<List<BookDTO>> getRecommendations(@PathVariable Long userId) {
    return ResponseEntity.ok(recommendationService.getRecommendations(userId));
  }
}

