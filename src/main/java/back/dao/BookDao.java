package back.dao;

import back.models.Book;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookDao extends JpaRepository<Book, Long> {
  List<Book> findByGenre(String genre);

  List<Book> findByAuthor(String author);

  List<Book> findByTitleContainingIgnoreCaseAndAuthorContainingIgnoreCaseAndGenreContainingIgnoreCase(
    String title, String author, String genre);

  List<Book> findTop10ByOrderByCreatedAtDesc();

  // Удаляем метод с рейтингом, так как он вычисляемый
  // List<Book> findTop10ByOrderByRatingDesc();

  List<Book> findTop10ByOrderByTimesAddedToCartDesc();

  // Новый метод для загрузки книг с отзывами (опционально)
  @Query("SELECT b FROM Book b LEFT JOIN FETCH b.reviews WHERE b.id = :id")
  Optional<Book> findByIdWithReviews(@Param("id") Long id);
}


