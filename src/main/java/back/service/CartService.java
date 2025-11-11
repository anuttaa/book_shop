package back.service;
import back.dao.BookDao;
import back.dao.CartItemDao;
import back.dao.UserDao;
import back.dto.CartItemDTO;
import back.mappers.CartItemMapper;
import back.models.Book;
import back.models.CartItem;
import back.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

  private final CartItemDao cartItemDao;
  private final UserDao userDao;
  private final BookDao bookDao;
  private final CartItemMapper cartItemMapper;

  public List<CartItemDTO> getUserCart(Long userId) {
    return cartItemDao.findByUserId(userId).stream()
      .map(cartItemMapper::toDTO)
      .collect(Collectors.toList());
  }

  public CartItemDTO addToCart(Long userId, Long bookId, int quantity) {
    User user = userDao.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    Book book = bookDao.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found"));

    CartItem cartItem = new CartItem();
    cartItem.setUser(user);
    cartItem.setBook(book);
    cartItem.setQuantity(quantity);

    return cartItemMapper.toDTO(cartItemDao.save(cartItem));
  }

  public void removeFromCart(Long cartItemId) {
    cartItemDao.deleteById(cartItemId);
  }
}
