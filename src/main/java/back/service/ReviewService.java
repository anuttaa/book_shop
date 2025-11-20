package back.service;

import back.dao.BookDao;
import back.dao.ReviewDao;
import back.dao.UserDao;
import back.dto.ReviewDTO;
import back.mappers.ReviewMapper;
import back.models.Book;
import back.models.Review;
import back.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

  private final ReviewDao reviewDao;
  private final UserDao userDao;
  private final BookDao bookDao;
  private final ReviewMapper reviewMapper;

  public List<ReviewDTO> getReviewsByBook(Long bookId) {
    return reviewDao.findByBookId(bookId).stream()
      .map(reviewMapper::toDTO)
      .collect(Collectors.toList());
  }

  public List<ReviewDTO> getReviewsByUser(Long userId) {
    return reviewDao.findByUserId(userId).stream()
      .map(reviewMapper::toDTO)
      .collect(Collectors.toList());
  }

  public ReviewDTO addReview(Long userId, Long bookId, ReviewDTO dto) {
    if (reviewDao.existsByUserIdAndBookId(userId, bookId)) {
      throw new RuntimeException("User has already reviewed this book");
    }

    User user = userDao.findById(userId)
      .orElseThrow(() -> new RuntimeException("User not found"));
    Book book = bookDao.findById(bookId)
      .orElseThrow(() -> new RuntimeException("Book not found"));

    Review review = new Review();
    review.setUser(user);
    review.setBook(book);
    review.setRating(dto.getRating());
    review.setComment(dto.getComment());
    review.setCreatedAt(LocalDateTime.now());

    Review savedReview = reviewDao.save(review);

    updateBookRating(bookId);

    return reviewMapper.toDTO(savedReview);
  }

  public ReviewDTO updateReview(Long reviewId, Long userId, ReviewDTO dto) {
    Review review = reviewDao.findById(reviewId)
      .orElseThrow(() -> new RuntimeException("Review not found"));

    if (!review.getUser().getId().equals(userId)) {
      throw new RuntimeException("You can only edit your own reviews");
    }

    review.setRating(dto.getRating());
    review.setComment(dto.getComment());

    Review updatedReview = reviewDao.save(review);

    updateBookRating(review.getBook().getId());

    return reviewMapper.toDTO(updatedReview);
  }

  public void deleteReview(Long reviewId, Long userId) {
    Review review = reviewDao.findById(reviewId)
      .orElseThrow(() -> new RuntimeException("Review not found"));

    User user = userDao.findById(userId)
      .orElseThrow(() -> new RuntimeException("User not found"));

    boolean isAdmin = user.getRole() != null &&
      (user.getRole().equals("ADMIN") || user.getRole().equals("ROLE_ADMIN"));

    if (!review.getUser().getId().equals(userId) && !isAdmin) {
      throw new RuntimeException("You can only delete your own reviews");
    }

    Long bookId = review.getBook().getId();
    reviewDao.deleteById(reviewId);

    updateBookRating(bookId);
  }

  public void deleteReview(Long reviewId) {
    Review review = reviewDao.findById(reviewId)
      .orElseThrow(() -> new RuntimeException("Review not found"));

    Long bookId = review.getBook().getId();
    reviewDao.deleteById(reviewId);

    updateBookRating(bookId);
  }

  private void updateBookRating(Long bookId) {
    List<Review> reviews = reviewDao.findByBookId(bookId);

    if (reviews.isEmpty()) {
      Book book = bookDao.findById(bookId)
        .orElseThrow(() -> new RuntimeException("Book not found"));
      book.setRating(0.0);
      bookDao.save(book);
      return;
    }

    double averageRating = reviews.stream()
      .mapToInt(Review::getRating)
      .average()
      .orElse(0.0);

    averageRating = Math.round(averageRating * 10.0) / 10.0;

    Book book = bookDao.findById(bookId)
      .orElseThrow(() -> new RuntimeException("Book not found"));
    book.setRating(averageRating);
    bookDao.save(book);
  }

  public boolean hasUserReviewedBook(Long userId, Long bookId) {
    return reviewDao.existsByUserIdAndBookId(userId, bookId);
  }

  public Optional<ReviewDTO> getUserReviewForBook(Long userId, Long bookId) {
    return reviewDao.findByUserIdAndBookId(userId, bookId)
      .map(reviewMapper::toDTO);
  }
}
