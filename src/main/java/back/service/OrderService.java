package back.service;

import back.dao.BookDao;
import back.dao.OrderDao;
import back.dao.OrderItemDao;
import back.dao.UserDao;
import back.dto.CartItemDTO;
import back.dto.OrderDTO;
import back.dto.UpdateOrderRequest;
import back.enums.OrderStatus;
import back.mappers.OrderMapper;
import back.models.Book;
import back.models.Order;
import back.models.OrderItem;
import back.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

  private final OrderDao orderDao;
  private final OrderItemDao orderItemDao;
  private final UserDao userDao;
  private final CartService cartService;
  private final BookDao bookDao;
  private final OrderMapper orderMapper;
  private final EmailService emailService;

  @Transactional
  public OrderDTO createOrderFromCart(Long userId) {
    User user = userDao.findById(userId)
      .orElseThrow(() -> new RuntimeException("User not found"));

    List<CartItemDTO> cartItems = cartService.getUserCart(userId);
    if (cartItems.isEmpty()) {
      throw new RuntimeException("Cart is empty");
    }

    Order order = new Order();
    order.setUser(user);
    order.setStatus(OrderStatus.created);
    order.setTotalPrice(0.0);

    List<OrderItem> orderItems = new ArrayList<>();
    double totalPrice = 0.0;

    for (CartItemDTO cartItem : cartItems) {
      Book book = bookDao.findById(cartItem.getBook().getId())
        .orElseThrow(() -> new RuntimeException("Book not found"));

      OrderItem orderItem = new OrderItem();
      orderItem.setOrder(order);
      orderItem.setBook(book);
      orderItem.setQuantity(cartItem.getQuantity());
      orderItem.setPrice(book.getPrice() * cartItem.getQuantity());

      totalPrice += orderItem.getPrice();
      orderItems.add(orderItem);
    }

    order.setOrderItems(orderItems);
    order.setTotalPrice(totalPrice);

    Order savedOrder = orderDao.save(order);

    cartService.clearUserCart(userId);

    return orderMapper.toDTO(savedOrder);
  }

  public List<OrderDTO> getOrdersByUser(Long userId) {
    return orderDao.findByUserIdWithItems(userId).stream()
      .map(orderMapper::toDTO)
      .collect(Collectors.toList());
  }

  public OrderDTO payOrder(Long orderId) {
    Order order = orderDao.findById(orderId)
      .orElseThrow(() -> new RuntimeException("Order not found"));

    if (order.getStatus() != OrderStatus.created) {
      throw new RuntimeException("Order cannot be paid. Current status: " + order.getStatus());
    }

    order.setStatus(OrderStatus.paid);
    order.setUpdatedAt(LocalDateTime.now());

    return orderMapper.toDTO(orderDao.save(order));
  }

  public void deleteOrder(Long orderId) {
    orderDao.deleteById(orderId);
  }

  public List<OrderDTO> getAllOrders() {
    return orderDao.findAll().stream()
      .map(orderMapper::toDTO)
      .collect(Collectors.toList());
  }

  @Transactional
  public OrderDTO updateOrder(Long orderId, UpdateOrderRequest updateRequest) {
    Order order = orderDao.findById(orderId)
      .orElseThrow(() -> new RuntimeException("Order not found"));

    if (updateRequest.getStatus() != null) {
      try {
        OrderStatus newStatus = OrderStatus.valueOf(updateRequest.getStatus().toLowerCase());
        order.setStatus(newStatus);
        emailService.sendOrderStatusUpdate(order.getUser(), order);
      } catch (IllegalArgumentException e) {
        throw new RuntimeException("Invalid order status: " + updateRequest.getStatus());
      }
    }

    if (updateRequest.getTotalPrice() != null) {
      if (updateRequest.getTotalPrice() < 0) {
        throw new RuntimeException("Total price cannot be negative");
      }
      order.setTotalPrice(updateRequest.getTotalPrice());
    }

    Order updatedOrder = orderDao.save(order);
    return orderMapper.toDTO(updatedOrder);
  }
}

