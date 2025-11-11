package back.service;

import back.dao.OrderDao;
import back.dao.UserDao;
import back.dto.OrderDTO;
import back.enums.OrderStatus;
import back.mappers.OrderMapper;
import back.models.Order;
import back.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

  private final OrderDao orderDao;
  private final UserDao userDao;
  private final OrderMapper orderMapper;

  // Получить все заказы пользователя
  public List<OrderDTO> getOrdersByUser(Long userId) {
    return orderDao.findByUserId(userId).stream()
      .map(orderMapper::toDTO)
      .collect(Collectors.toList());
  }

  // Создать новый заказ для пользователя
  public OrderDTO createOrder(Long userId) {
    User user = userDao.findById(userId)
      .orElseThrow(() -> new RuntimeException("User not found"));

    Order order = new Order();
    order.setUser(user);
    order.setStatus(OrderStatus.CREATED);
    order.setTotalPrice(0.0); // если сразу считаем позже

    return orderMapper.toDTO(orderDao.save(order));
  }

  // Оплатить заказ
  public OrderDTO payOrder(Long orderId) {
    Order order = orderDao.findById(orderId)
      .orElseThrow(() -> new RuntimeException("Order not found"));

    if (order.getStatus() != OrderStatus.CREATED) {
      throw new RuntimeException("Order cannot be paid. Current status: " + order.getStatus());
    }

    order.setStatus(OrderStatus.PAID);
    order.setUpdatedAt(LocalDateTime.now());

    return orderMapper.toDTO(orderDao.save(order));
  }

  // Удалить заказ
  public void deleteOrder(Long orderId) {
    orderDao.deleteById(orderId);
  }
}
