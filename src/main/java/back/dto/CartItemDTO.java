package back.dto;

import back.models.Book;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class CartItemDTO {
  private Long id;
  private Book book;
  private double price;
  private int quantity;
}

