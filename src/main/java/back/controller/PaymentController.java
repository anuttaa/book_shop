package back.controller;

import back.dto.PaymentDTO;
import back.dto.PaymentRequest;
import back.service.AuthenticationService;
import back.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

  private final PaymentService paymentService;
  private final AuthenticationService authenticationService;

  @PostMapping
  public ResponseEntity<PaymentDTO> createPayment(@RequestBody PaymentRequest request) {
    Long userId = authenticationService.getCurrentUserId();
    return ResponseEntity.ok(paymentService.createPayment(request, userId));
  }

  @GetMapping("/by-order/{orderId}")
  public ResponseEntity<PaymentDTO> getPaymentByOrder(@PathVariable Long orderId) {
    PaymentDTO dto = paymentService.getByOrderId(orderId);
    if (dto == null) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.ok(dto);
  }
}
