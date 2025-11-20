package back.service;

import back.dao.UserDao;
import back.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

  private final UserDao userDao;

  public Long getCurrentUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new RuntimeException("User not authenticated");
    }

    String username = authentication.getName();
    User user = userDao.findByUsername(username)
      .orElseThrow(() -> new RuntimeException("User not found"));

    return user.getId();
  }

  public User getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new RuntimeException("User not authenticated");
    }

    String username = authentication.getName();
    return userDao.findByUsername(username)
      .orElseThrow(() -> new RuntimeException("User not found"));
  }
}
