package back.service;

import back.dao.BookDao;
import back.dao.OrderDao;
import back.dao.UserDao;
import back.dto.UserDTO;
import back.enums.Role;
import back.mappers.UserMapper;
import back.models.Book;
import back.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

  private final UserDao userDao;
  private final OrderDao orderDao;
  private final BookDao bookDao;
  private final UserMapper userMapper;

  public List<UserDTO> getAllUsers() {
    return userDao.findAll().stream()
      .map(userMapper::toDTO)
      .collect(Collectors.toList());
  }

  public void blockUser(Long userId) {
    User user = userDao.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    user.setRole(Role.GUEST);
    userDao.save(user);
  }

  public Map<String, Long> getSalesStatistics() {
    return bookDao.findAll().stream()
      .collect(Collectors.toMap(
        Book::getTitle,
        book -> orderDao.countByBookId(book.getId())
      ));
  }
}


