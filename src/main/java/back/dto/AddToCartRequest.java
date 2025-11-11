package back.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddToCartRequest {
  private Long bookId;
  private Integer quantity = 1;
}
