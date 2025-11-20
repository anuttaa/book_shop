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
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

  private final UserDao userDao;
  private final UserMapper userMapper;
  private final BCryptPasswordEncoder passwordEncoder;

  public User saveUser(User user) {
    return userDao.save(user);
  }

  public User getUserEntityById(Long userId) {
    return userDao.findById(userId)
      .orElseThrow(() -> new RuntimeException("User not found"));
  }

  public UserDTO createUser(UserDTO dto) {
    User user = userMapper.toEntity(dto);
    user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
    if (user.getRole() == null) {
      user.setRole(Role.user);
    }
    return userMapper.toDTO(userDao.save(user));
  }

  public void deleteUser(Long userId) {
    userDao.deleteById(userId);
  }

  public void changePassword(Long userId, String currentPassword, String newPassword) {
    User user = getUserEntityById(userId);
    if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
      throw new RuntimeException("Current password is incorrect");
    }
    user.setPasswordHash(passwordEncoder.encode(newPassword));
    userDao.save(user);
  }

  public boolean isSubscribed(Long userId) {
    User user = getUserEntityById(userId);
    return Boolean.TRUE.equals(user.getSubscribed());
  }

  public void updateSubscription(Long userId, boolean subscribed) {
    User user = getUserEntityById(userId);
    user.setSubscribed(subscribed);
    userDao.save(user);
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

  public UserDTO getUserByUsername(String username) {
    User user = userDao.findByUsername(username)
      .orElseThrow(() -> new RuntimeException("User not found"));
    return userMapper.toDTO(user);
  }

  public User getUserEntityByUsername(String username) {
    return userDao.findByUsername(username)
      .orElseThrow(() -> new RuntimeException("User not found"));
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

  public UserDTO blockUser(Long userId) {
    User user = getUserEntityById(userId);
    user.setRole(Role.guest);
    return userMapper.toDTO(userDao.save(user));
  }

  public UserDTO unblockUser(Long userId) {
    User user = getUserEntityById(userId);
    user.setRole(Role.user);
    return userMapper.toDTO(userDao.save(user));
  }

  public List<UserDTO> getAllUsers() {
    return userDao.findAll().stream()
      .map(userMapper::toDTO)
      .collect(Collectors.toList());
  }

  public UserDTO getUserById(Long userId) {
    User user = userDao.findById(userId)
      .orElseThrow(() -> new RuntimeException("User not found"));
    return userMapper.toDTO(user);
  }

  public UserDTO updateUser(Long userId, UserDTO dto) {
    User user = getUserEntityById(userId);

    if (dto.getUsername() != null) {
      user.setUsername(dto.getUsername());
    }
    if (dto.getEmail() != null) {
      user.setEmail(dto.getEmail());
    }
    if (dto.getSubscribed() != null) {
      user.setSubscribed(dto.getSubscribed());
    }
    if (dto.getRole() != null) {
      try {
        Role role = Role.valueOf(dto.getRole().toLowerCase());
        user.setRole(role);
      } catch (IllegalArgumentException e) {
        throw new RuntimeException("Invalid role: " + dto.getRole());
      }
    }
    return userMapper.toDTO(userDao.save(user));
  }
}


