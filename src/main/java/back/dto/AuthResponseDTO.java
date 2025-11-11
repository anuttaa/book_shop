package back.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class AuthResponseDTO {
  private String token;
  private String username;
  private String role;
}

