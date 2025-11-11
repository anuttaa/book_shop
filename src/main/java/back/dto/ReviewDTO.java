package back.dto;

import lombok.Data;

@Data
public class ReviewDTO {
  private Long id;
  private Long bookId;
  private Long userId;
  private String username;
  private int rating;
  private String comment;
}

