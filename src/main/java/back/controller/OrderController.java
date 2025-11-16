package back.controller;

import back.dto.OrderDTO;
import back.service.AuthenticationService;
import back.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

  private final OrderService orderService;
  private final AuthenticationService authenticationService;

  @GetMapping
  public ResponseEntity<List<OrderDTO>> getCurrentUserOrders() {
    Long userId = authenticationService.getCurrentUserId();
    return ResponseEntity.ok(orderService.getOrdersByUser(userId));
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
}

