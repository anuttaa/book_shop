package back.dao;

import back.models.Review;

import org.springframework.data.domain.PageRequest;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface ReviewDao extends JpaRepository<Review, Long> {
  List<Review> findByBookId(Long bookId);

  @Query("SELECT r.book.genre FROM Review r WHERE r.user.id = :userId GROUP BY r.book.genre ORDER BY COUNT(r) DESC")
  List<String> findFavoriteGenresByUser(@Param("userId") Long userId, Pageable pageable);


}


