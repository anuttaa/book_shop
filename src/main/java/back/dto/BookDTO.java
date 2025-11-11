package back.dto;

import lombok.Data;

@Data
public class BookDTO {
  private Long id;
  private String title;
  private String author;
  private String genre;
  private String description;
  private double price;
  private double rating;
  private String coverImageUrl;
}
