package back.dto;

import back.enums.BookType;
import back.models.Media;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Data
public class BookDTO {
  private Long id;
  private String title;
  private String author;
  private String description;
  private String genre;
  private Double price;
  private Double rating;
  private Integer reviewCount;
  private Integer timesAddedToCart;
  private LocalDateTime createdAt;
  private BookType type;
  private String cover;
}

