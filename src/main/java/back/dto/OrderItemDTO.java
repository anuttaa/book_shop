package back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
  private Long id;
  private BookDTO book;
  private Integer quantity = 1;
  private Double price;

  public Double getSubtotal() {
    return price * quantity;
  }

  public String getBookTitle() {
    return book != null ? book.getTitle() : null;
  }

  public String getBookAuthor() {
    return book != null ? book.getAuthor() : null;
  }
}
