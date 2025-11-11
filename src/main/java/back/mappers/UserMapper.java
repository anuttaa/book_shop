package back.mappers;

import back.dto.UserDTO;
import back.models.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
  UserDTO toDTO(User user);
  User toEntity(UserDTO dto);
}

