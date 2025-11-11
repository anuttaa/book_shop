package back.dto;

import lombok.Data;

@Data
public class CartItemDTO {
  private Long id;
  private Long bookId;
  private String bookTitle;
  private double price;
  private int quantity;
}

