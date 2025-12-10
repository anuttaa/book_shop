package back.service;

import back.dao.OrderDao;
import back.dao.PaymentDao;
import back.dto.PaymentDTO;
import back.dto.PaymentRequest;
import back.enums.OrderStatus;
import back.enums.PaymentMethod;
import back.enums.PaymentStatus;
import back.mappers.PaymentMapper;
import back.models.Order;
import back.models.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private final PaymentDao paymentDao;
  private final OrderDao orderDao;
  private final PaymentMapper paymentMapper;

  @Transactional
  public PaymentDTO createPayment(PaymentRequest request, Long currentUserId) {
    Order order = orderDao.findById(request.getOrderId())
      .orElseThrow(() -> new RuntimeException("Order not found"));

    if (order.getUser() == null || !order.getUser().getId().equals(currentUserId)) {
      throw new RuntimeException("Access denied");
    }

    Double amount = request.getAmount() != null ? request.getAmount() : order.getTotalPrice();
    if (amount == null || amount <= 0) {
      throw new RuntimeException("Invalid amount");
    }

    PaymentMethod method;
    try {
      method = request.getMethod() != null ? PaymentMethod.valueOf(request.getMethod().toLowerCase()) : PaymentMethod.cash;
    } catch (IllegalArgumentException e) {
      throw new RuntimeException("Invalid payment method: " + request.getMethod());
    }

    Payment payment = new Payment();
    payment.setOrder(order);
    payment.setAmount(amount);
    payment.setCurrency(request.getCurrency() != null ? request.getCurrency() : "RUB");
    payment.setMethod(method);

    if (method == PaymentMethod.card) {
      payment.setStatus(PaymentStatus.paid);
      payment.setPaidAt(LocalDateTime.now());
      if (request.getCardNumber() != null) {
        String digits = request.getCardNumber().replaceAll("\\D+", "");
        if (digits.length() >= 4) {
          payment.setCardLast4(digits.substring(digits.length() - 4));
        }
      }
      if (request.getCardBrand() != null) {
        payment.setCardBrand(request.getCardBrand());
      }
      order.setStatus(OrderStatus.paid);
      order.setUpdatedAt(LocalDateTime.now());
    } else {
      payment.setStatus(PaymentStatus.pending);
    }

    Payment saved = paymentDao.save(payment);
    order.setPayment(saved);
    orderDao.save(order);

    return paymentMapper.toDTO(saved);
  }

  @Transactional(readOnly = true)
  public PaymentDTO getByOrderId(Long orderId) {
    return paymentDao.findByOrderId(orderId)
      .map(paymentMapper::toDTO)
      .orElse(null);
  }
}
