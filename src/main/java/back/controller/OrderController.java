package back.controller;

import back.dao.UserDao;
import back.dto.OrderDTO;
import back.dto.UpdateOrderRequest;
import back.models.User;
import back.service.AuthenticationService;
import back.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

  private final OrderService orderService;
  private final AuthenticationService authenticationService;
  private final UserDao userDao;

  @GetMapping
  public ResponseEntity<List<OrderDTO>> getCurrentUserOrders() {
    try {
      System.out.println("=== OrderController.getCurrentUserOrders() ===");

      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      System.out.println("Direct auth: " + auth);
      System.out.println("Direct auth name: " + (auth != null ? auth.getName() : "null"));

      if (auth != null && auth.isAuthenticated()) {
        String username = auth.getName();
        System.out.println("Looking for user: " + username);

        User user = userDao.findByUsername(username)
          .orElseThrow(() -> new RuntimeException("User not found directly: " + username));

        System.out.println("Found user directly: " + user.getUsername() + " ID: " + user.getId());
        return ResponseEntity.ok(orderService.getOrdersByUser(user.getId()));
      }

      throw new RuntimeException("Not authenticated");

    } catch (Exception e) {
      System.err.println("Error in getCurrentUserOrders: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(500).build();
    }
  }

  @PostMapping("/create-from-cart")
  public ResponseEntity<OrderDTO> createOrderFromCart() {
    Long userId = authenticationService.getCurrentUserId();
    return ResponseEntity.ok(orderService.createOrderFromCart(userId));
  }

  @PostMapping("/{orderId}/pay")
  public ResponseEntity<OrderDTO> payOrder(@PathVariable Long orderId) {
    return ResponseEntity.ok(orderService.payOrder(orderId));
  }

  @DeleteMapping("/{orderId}")
  public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
    orderService.deleteOrder(orderId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/admin/all")
  public ResponseEntity<List<OrderDTO>> getAllOrders() {
    return ResponseEntity.ok(orderService.getAllOrders());
  }

  @PutMapping("/{orderId}")
  public ResponseEntity<OrderDTO> updateOrder(
    @PathVariable Long orderId,
    @RequestBody UpdateOrderRequest updateRequest) {
    return ResponseEntity.ok(orderService.updateOrder(orderId, updateRequest));
  }
}

