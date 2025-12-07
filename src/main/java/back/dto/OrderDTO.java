package back.dto;

import back.enums.OrderStatus;
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
  private UserDTO user;
  private OrderStatus status = OrderStatus.created;
  private Double totalPrice;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private List<OrderItemDTO> orderItems;
}


