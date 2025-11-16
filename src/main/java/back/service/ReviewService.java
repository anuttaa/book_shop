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

import java.util.List;
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

  public ReviewDTO addReview(Long userId, Long bookId, ReviewDTO dto) {
    User user = userDao.findById(userId)
      .orElseThrow(() -> new RuntimeException("User not found"));
    Book book = bookDao.findById(bookId)
      .orElseThrow(() -> new RuntimeException("Book not found"));

    Review review = new Review();
    review.setUser(user);
    review.setBook(book);
    review.setRating(dto.getRating());
    review.setComment(dto.getComment());

    return reviewMapper.toDTO(reviewDao.save(review));
  }

  public void deleteReview(Long reviewId) {
    reviewDao.deleteById(reviewId);
  }
}
