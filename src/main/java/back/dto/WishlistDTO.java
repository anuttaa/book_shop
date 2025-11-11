package back.dto;

import lombok.Data;
import java.util.List;

@Data
public class WishlistDTO {
  private Long userId;
  private List<BookDTO> books;
}

