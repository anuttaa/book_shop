package back.dto;

import back.enums.FileType;
import back.models.Book;

import java.time.LocalDateTime;

public class MediaDTO {
  private Integer id;
  private Book book;
  private FileType fileType;
  private String fileName;
  private byte[] fileData;
  private LocalDateTime createdAt;
}
