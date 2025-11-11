package back.dto;

import back.enums.FileType;
import back.models.Book;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Data
public class MediaDTO {
  private Long id;
  private Long bookId;
  private FileType fileType;
  private String fileName;
  private String fileUrl;
  private LocalDateTime createdAt;
}
