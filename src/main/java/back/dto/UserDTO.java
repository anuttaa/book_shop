package back.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Data
public class UserDTO {
  private Long id;
  private String username;
  private String password;
  private String email;
  private Boolean subscribed;
  private String status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private String role;
}

