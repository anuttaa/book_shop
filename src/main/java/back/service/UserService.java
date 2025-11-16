package back.service;

import back.dao.UserDao;
import back.dto.UserDTO;
import back.enums.Role;
import back.mappers.UserMapper;
import back.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

  private final UserDao userDao;
  private final UserMapper userMapper;
  private final BCryptPasswordEncoder passwordEncoder;

  public List<UserDTO> getAllUsers() {
    return userDao.findAll().stream()
      .map(userMapper::toDTO)
      .collect(Collectors.toList());
  }

  public UserDTO getUserById(Long id) {
    User user = userDao.findById(id)
      .orElseThrow(() -> new RuntimeException("User not found"));
    return userMapper.toDTO(user);
  }

  public User getUserEntityById(Long userId) {
    return userDao.findById(userId)
      .orElseThrow(() -> new RuntimeException("User not found"));
  }

  public UserDTO createUser(UserDTO dto) {
    User user = userMapper.toEntity(dto);
    user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
    return userMapper.toDTO(userDao.save(user));
  }

  public UserDTO updateUser(Long id, UserDTO dto) {
    User user = userDao.findById(id)
      .orElseThrow(() -> new RuntimeException("User not found"));
    user.setUsername(dto.getUsername());
    user.setEmail(dto.getEmail());
    return userMapper.toDTO(userDao.save(user));
  }

  public void deleteUser(Long id) {
    userDao.deleteById(id);
  }

  public UserDTO registerUser(UserDTO dto) {
    if (userDao.findByUsername(dto.getUsername()).isPresent()) {
      throw new RuntimeException("Username already exists");
    }

    User user = userMapper.toEntity(dto);
    user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
    if (user.getRole() == null) {
      user.setRole(Role.user);
    }
    userDao.save(user);

    return userMapper.toDTO(user);
  }

  public UserDTO login(String username, String password) {
    User user = userDao.findByUsername(username)
      .orElseThrow(() -> new RuntimeException("Invalid username or password"));

    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
      throw new RuntimeException("Invalid username or password");
    }

    return userMapper.toDTO(user);
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    User user = userDao.findByUsername(username)
      .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    String roleName = user.getRole().name();

    return org.springframework.security.core.userdetails.User.builder()
      .username(user.getUsername())
      .password(user.getPasswordHash())
      .roles(roleName)
      .build();
  }
}


