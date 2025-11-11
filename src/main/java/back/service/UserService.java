package back.service;

import back.dao.UserDao;
import back.dto.UserDTO;
import back.mappers.UserMapper;
import back.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

  private final UserDao userDao;
  private final UserMapper userMapper;

  public List<UserDTO> getAllUsers() {
    return userDao.findAll().stream()
      .map(userMapper::toDTO)
      .collect(Collectors.toList());
  }

  public UserDTO getUserById(Long id) {
    User user = userDao.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    return userMapper.toDTO(user);
  }

  public UserDTO createUser(UserDTO dto) {
    User user = userMapper.toEntity(dto);
    return userMapper.toDTO(userDao.save(user));
  }

  public UserDTO updateUser(Long id, UserDTO dto) {
    User user = userDao.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    user.setUsername(dto.getUsername());
    user.setEmail(dto.getEmail());
    return userMapper.toDTO(userDao.save(user));
  }

  public void deleteUser(Long id) {
    userDao.deleteById(id);
  }
}
