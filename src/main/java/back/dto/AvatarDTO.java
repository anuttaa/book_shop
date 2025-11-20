package back.dto;

import lombok.Data;

@Data
public class AvatarDTO {
  private Long id;
  private String fileUrl;
  private String fileName;
  private String fileType;
}
