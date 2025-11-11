package back.controller;

import back.dto.AddToCartRequest;
import back.dto.CartItemDTO;
import back.dto.UpdateCartQuantityRequest;
import back.service.AuthenticationService;
import back.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

  private final CartService cartService;
  private final AuthenticationService authenticationService;

  public CartController(CartService cartService, AuthenticationService authenticationService) {
    this.cartService = cartService;
    this.authenticationService = authenticationService;
  }

  @GetMapping
  public ResponseEntity<List<CartItemDTO>> getCurrentUserCart() {
    Long userId = authenticationService.getCurrentUserId();
    return ResponseEntity.ok(cartService.getUserCart(userId));
  }

  @PostMapping("/add")
  public ResponseEntity<CartItemDTO> addToCart(@RequestBody AddToCartRequest request) {
    Long userId = authenticationService.getCurrentUserId();
    CartItemDTO cartItem = cartService.addToCart(userId, request.getBookId(), request.getQuantity());
    return ResponseEntity.ok(cartItem);
  }

  @DeleteMapping("/remove/{bookId}")
  public ResponseEntity<Void> removeFromCart(@PathVariable Long bookId) {
    Long userId = authenticationService.getCurrentUserId();
    cartService.removeFromCartByBookId(userId, bookId);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/update-quantity")
  public ResponseEntity<Void> updateQuantity(@RequestBody UpdateCartQuantityRequest request) {
    cartService.updateCartItemQuantity(request.getCartItemId(), request.getQuantity());
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/clear")
  public ResponseEntity<Void> clearCart() {
    Long userId = authenticationService.getCurrentUserId();
    cartService.clearUserCart(userId);
    return ResponseEntity.noContent().build();
  }
}