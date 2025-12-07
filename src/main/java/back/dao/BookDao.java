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
  List<Book> findByAuthorContainingIgnoreCase(String author);

  List<Book> findByTitleContainingIgnoreCaseAndAuthorContainingIgnoreCaseAndGenreContainingIgnoreCase(
    String title, String author, String genre);

  @Query("SELECT b FROM Book b LEFT JOIN FETCH b.reviews WHERE b.id = :id")
  Optional<Book> findByIdWithReviews(@Param("id") Long id);

  List<Book> findTop15ByOrderByCreatedAtDesc();
  List<Book> findTop15ByOrderByTimesAddedToCartDesc();

  @Query("SELECT oi.book FROM OrderItem oi JOIN oi.order o WHERE o.user.id = :userId")
  List<Book> findBooksOrderedByUser(@Param("userId") Long userId);

  @Query("SELECT b.genre, COUNT(b.genre) as genreCount FROM OrderItem oi " +
    "JOIN oi.book b " +
    "JOIN oi.order o " +
    "WHERE o.user.id = :userId " +
    "GROUP BY b.genre " +
    "ORDER BY genreCount DESC")
  List<Object[]> findUserFavoriteGenres(@Param("userId") Long userId);

  @Query("SELECT b.author, COUNT(b.author) as authorCount FROM OrderItem oi " +
    "JOIN oi.book b " +
    "JOIN oi.order o " +
    "WHERE o.user.id = :userId AND b.author IS NOT NULL " +
    "GROUP BY b.author " +
    "ORDER BY authorCount DESC")
  List<Object[]> findUserFavoriteAuthors(@Param("userId") Long userId);

  @Query("SELECT b FROM Book b " +
    "WHERE b.genre IN :genres " +
    "AND b.id NOT IN (SELECT oi.book.id FROM OrderItem oi JOIN oi.order o WHERE o.user.id = :userId) " +
    "ORDER BY b.timesAddedToCart DESC, b.createdAt DESC " +
    "LIMIT :limit")
  List<Book> findBooksByGenresExcludingUserBooks(
    @Param("genres") List<String> genres,
    @Param("userId") Long userId,
    @Param("limit") int limit
  );

  @Query("SELECT b FROM Book b " +
    "WHERE b.author IN :authors " +
    "AND b.id NOT IN (SELECT oi.book.id FROM OrderItem oi JOIN oi.order o WHERE o.user.id = :userId) " +
    "ORDER BY b.timesAddedToCart DESC, b.createdAt DESC " +
    "LIMIT :limit")
  List<Book> findBooksByAuthorsExcludingUserBooks(
    @Param("authors") List<String> authors,
    @Param("userId") Long userId,
    @Param("limit") int limit
  );

  @Query("SELECT DISTINCT b FROM Book b " +
    "WHERE b.id IN (" +
    "  SELECT oi.book.id FROM OrderItem oi " +
    "  JOIN oi.order o " +
    "  WHERE o.user.id IN (" +
    "    SELECT DISTINCT o2.user.id FROM Order o2 " +
    "    JOIN o2.orderItems oi2 " +
    "    WHERE oi2.book.id IN (" +
    "      SELECT oi3.book.id FROM OrderItem oi3 " +
    "      JOIN oi3.order o3 " +
    "      WHERE o3.user.id = :userId" +
    "    ) AND o2.user.id != :userId" +
    "  )" +
    ") " +
    "AND b.id NOT IN (SELECT oi4.book.id FROM OrderItem oi4 JOIN oi4.order o4 WHERE o4.user.id = :userId) " +
    "ORDER BY b.timesAddedToCart DESC " +
    "LIMIT :limit")
  List<Book> findBooksFromSimilarUsers(
    @Param("userId") Long userId,
    @Param("limit") int limit
  );
  List<Book> findByGenreContainingIgnoreCase(String genre);
}


