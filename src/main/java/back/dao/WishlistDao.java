package back.dao;

import back.models.Book;
import back.models.Wishlist;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface WishlistDao extends JpaRepository<Wishlist, Long> {
  Optional<Wishlist> findByUserId(Long userId);

  @Query("SELECT COUNT(w) > 0 FROM Wishlist w JOIN w.books b WHERE w.user.id = :userId AND b.id = :bookId")
  boolean existsByUserIdAndBookId(@Param("userId") Long userId, @Param("bookId") Long bookId);

  @Modifying
  @Query("DELETE FROM Wishlist w WHERE w.user.id = :userId AND :book MEMBER OF w.books")
  void removeBookFromWishlist(@Param("userId") Long userId, @Param("book") Book book);

  // Исправленный запрос - используем books вместо book
  @Query("SELECT b FROM Wishlist w JOIN w.books b WHERE w.user.id = :userId")
  List<Book> findBooksByUser(@Param("userId") Long userId);
}


