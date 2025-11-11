package back.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCartQuantityRequest {
  private Long cartItemId;
  private Integer quantity;
}