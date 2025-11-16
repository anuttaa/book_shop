package back.service;
import back.dao.BookDao;
import back.dao.UserDao;
import back.dao.WishlistDao;
import back.dto.BookDTO;
import back.dto.WishlistDTO;
import back.mappers.BookMapper;
import back.mappers.UserMapper;
import back.mappers.WishlistMapper;
import back.models.Book;
import back.models.User;
import back.models.Wishlist;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistService {

  private final WishlistDao wishlistRepository;
  private final BookDao bookRepository;
  private final UserService userService;
  private final WishlistMapper wishlistMapper;
  private final BookMapper bookMapper;

  public WishlistDTO getWishlistByUser(Long userId) {
    Wishlist wishlist = wishlistRepository.findByUserId(userId)
      .orElseThrow(() -> new RuntimeException("Wishlist not found for user: " + userId));
    return wishlistMapper.toDTO(wishlist);
  }

  public WishlistDTO addToWishlist(Long userId, Long bookId) {
    Wishlist wishlist = wishlistRepository.findByUserId(userId)
      .orElseGet(() -> createNewWishlist(userId));

    Book book = bookRepository.findById(bookId)
      .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

    if (!wishlist.getBooks().contains(book)) {
      wishlist.addBook(book);
      wishlistRepository.save(wishlist);
    }

    return wishlistMapper.toDTO(wishlist);
  }

  public void removeFromWishlist(Long userId, Long bookId) {
    Wishlist wishlist = wishlistRepository.findByUserId(userId)
      .orElseThrow(() -> new RuntimeException("Wishlist not found for user: " + userId));

    Book book = bookRepository.findById(bookId)
      .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

    if (wishlist.getBooks().contains(book)) {
      wishlist.removeBook(book);
      wishlistRepository.save(wishlist);
    }
  }

  public boolean isBookInWishlist(Long userId, Long bookId) {
    return wishlistRepository.existsByUserIdAndBookId(userId, bookId);
  }

  private Wishlist createNewWishlist(Long userId) {
    Wishlist newWishlist = new Wishlist();
    User user = userService.getUserEntityById(userId);
    newWishlist.setUser(user);
    return wishlistRepository.save(newWishlist);
  }

  public List<BookDTO> getWishlistBooks(Long userId) {
    Wishlist wishlist = wishlistRepository.findByUserId(userId)
      .orElseThrow(() -> new RuntimeException("Wishlist not found for user: " + userId));

    return wishlist.getBooks().stream()
      .map(bookMapper::toDTO)
      .collect(Collectors.toList());
  }
}



