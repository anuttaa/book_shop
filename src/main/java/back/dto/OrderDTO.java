package back.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {
  private Long id;
  private Long userId;
  private LocalDateTime orderDate;
  private double totalAmount;
  private String status;
  private List<CartItemDTO> items;
}

