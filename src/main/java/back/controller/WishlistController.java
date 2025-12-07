package back.controller;

import back.dto.WishlistDTO;
import back.service.AuthenticationService;
import back.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

  private final WishlistService wishlistService;
  private final AuthenticationService authenticationService;

  @GetMapping
  public ResponseEntity<WishlistDTO> getCurrentUserWishlist() {
    Long userId = authenticationService.getCurrentUserId();
    return ResponseEntity.ok(wishlistService.getWishlistByUser(userId));
  }

  @PostMapping("/add")
  public ResponseEntity<WishlistDTO> addToWishlist(@RequestParam Long bookId) {
    Long userId = authenticationService.getCurrentUserId();
    return ResponseEntity.ok(wishlistService.addToWishlist(userId, bookId));
  }

  @DeleteMapping("/remove")
  public ResponseEntity<Void> removeFromWishlist(@RequestParam Long bookId) {
    Long userId = authenticationService.getCurrentUserId();
    wishlistService.removeFromWishlist(userId, bookId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/check/{bookId}")
  public ResponseEntity<Boolean> isInWishlist(@PathVariable Long bookId) {
    Long userId = authenticationService.getCurrentUserId();
    boolean isInWishlist = wishlistService.isBookInWishlist(userId, bookId);
    return ResponseEntity.ok(isInWishlist);
  }
}


