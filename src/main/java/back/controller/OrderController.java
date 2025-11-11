package back.controller;

import back.dto.OrderDTO;
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

  @GetMapping("/{userId}")
  public ResponseEntity<List<OrderDTO>> getUserOrders(@PathVariable Long userId) {
    return ResponseEntity.ok(orderService.getOrdersByUser(userId));
  }

  @PostMapping("/{userId}/create")
  public ResponseEntity<OrderDTO> createOrder(@PathVariable Long userId) {
    return ResponseEntity.ok(orderService.createOrder(userId));
  }

  @PostMapping("/{orderId}/pay")
  public ResponseEntity<OrderDTO> payOrder(@PathVariable Long orderId) {
    return ResponseEntity.ok(orderService.payOrder(orderId));
  }
}

