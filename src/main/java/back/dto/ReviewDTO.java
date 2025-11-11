package back.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class ReviewDTO {
  private Long id;
  private Long bookId;
  private Long userId;
  private String username;
  private int rating;
  private String comment;
}

