package back.service;
import back.dao.BookDao;
import back.dao.UserDao;
import back.dao.WishlistDao;
import back.dto.WishlistDTO;
import back.mappers.WishlistMapper;
import back.models.Book;
import back.models.User;
import back.models.Wishlist;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

  private final WishlistDao wishlistDao;
  private final UserDao userDao;
  private final BookDao bookDao;
  private final WishlistMapper wishlistMapper;

  public List<WishlistDTO> getUserWishlist(Long userId) {
    return wishlistDao.findByUserId(userId).stream()
      .map(wishlistMapper::toDTO)
      .collect(Collectors.toList());
  }

  public WishlistDTO addBookToWishlist(Long userId, Long bookId) {
    User user = userDao.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    Book book = bookDao.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found"));

    Wishlist wishlist = new Wishlist();
    wishlist.setUser(user);
    wishlist.setBook(book);

    return wishlistMapper.toDTO(wishlistDao.save(wishlist));
  }

  public void removeBookFromWishlist(Long wishlistId) {
    wishlistDao.deleteById(wishlistId);
  }
}


