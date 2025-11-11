package back.mappers;

import back.dto.UserDTO;
import back.enums.Role;
import back.models.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

  @Mapping(target = "password", source = "passwordHash")
  @Mapping(target = "role", expression = "java(user.getRole() != null ? user.getRole().name() : \"USER\")")
  UserDTO toDTO(User user);

  @Mapping(target = "passwordHash", ignore = true)
  @Mapping(target = "role", expression = "java(mapRole(dto.getRole()))")
  User toEntity(UserDTO dto);

  default Role mapRole(String role) {
    if (role == null || role.trim().isEmpty()) {
      return Role.user;
    }
    try {
      return Role.valueOf(role.toUpperCase());
    } catch (IllegalArgumentException e) {
      return Role.user;
    }
  }
}

