package back.dto;

import back.enums.OrderStatus;
import back.models.OrderItem;
import back.models.User;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Data
public class OrderDTO {
  private Long id;
  private User user;
  private OrderStatus status = OrderStatus.CREATED;
  private Double totalPrice;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private List<OrderItem> orderItems;
}


