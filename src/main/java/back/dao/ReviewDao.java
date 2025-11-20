package back.dao;

import back.models.Review;

import org.springframework.data.domain.PageRequest;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface ReviewDao extends JpaRepository<Review, Long> {
  List<Review> findByBookId(Long bookId);

  @Query("SELECT r.book.genre FROM Review r WHERE r.user.id = :userId GROUP BY r.book.genre ORDER BY COUNT(r) DESC")
  List<String> findFavoriteGenresByUser(@Param("userId") Long userId, Pageable pageable);

  @Query("SELECT r.book.id FROM Review r WHERE r.user.id = :userId")
  List<Long> findBookIdsByUser(@Param("userId") Long userId);

  List<Review> findByUserId(Long userId);

  Optional<Review> findByUserIdAndBookId(Long userId, Long bookId);

  boolean existsByUserIdAndBookId(Long userId, Long bookId);

  @Modifying
  @Query("DELETE FROM Review r WHERE r.id = :reviewId")
  void deleteById(@Param("reviewId") Long reviewId);
}


