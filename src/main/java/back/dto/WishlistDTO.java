package back.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@Data
public class WishlistDTO {
  private Long userId;
  private List<BookDTO> books;
}

