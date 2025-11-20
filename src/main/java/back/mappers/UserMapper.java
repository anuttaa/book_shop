package back.mappers;

import back.dto.UserDTO;
import back.enums.Role;
import back.models.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

  @Mapping(target = "password", source = "passwordHash")
  @Mapping(target = "role", expression = "java(user.getRole() != null ? user.getRole().name().toLowerCase() : \"user\")")
  @Mapping(target = "subscribed", source = "subscribed")
  @Mapping(target = "status", expression = "java(getUserStatus(user))")
  UserDTO toDTO(User user);

  @Mapping(target = "passwordHash", ignore = true)
  @Mapping(target = "role", expression = "java(mapRole(dto.getRole()))")
  @Mapping(target = "subscribed", source = "subscribed")
  @Mapping(target = "avatarMediaId", ignore = true)
  User toEntity(UserDTO dto);

  default Role mapRole(String role) {
    if (role == null || role.trim().isEmpty()) {
      return Role.user;
    }
    try {
      return Role.valueOf(role.toLowerCase());
    } catch (IllegalArgumentException e) {
      return Role.user;
    }
  }

  default String getUserStatus(User user) {
    if (user == null || user.getRole() == null) {
      return "active";
    }
    return user.getRole() == Role.guest ? "blocked" : "active";
  }
}

