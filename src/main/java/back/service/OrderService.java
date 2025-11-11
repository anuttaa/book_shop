package back.service;

import back.dao.OrderDao;
import back.dao.UserDao;
import back.dto.OrderDTO;
import back.mappers.OrderMapper;
import back.models.Order;
import back.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

  private final OrderDao orderDao;
  private final UserDao userDao;
  private final OrderMapper orderMapper;

  public List<OrderDTO> getUserOrders(Long userId) {
    return orderDao.findByUserId(userId).stream()
      .map(orderMapper::toDTO)
      .collect(Collectors.toList());
  }

  public OrderDTO createOrder(Long userId, Order order) {
    User user = userDao.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    order.setUser(user);
    return orderMapper.toDTO(orderDao.save(order));
  }

  public void deleteOrder(Long orderId) {
    orderDao.deleteById(orderId);
  }
}
