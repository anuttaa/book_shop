package back.dao;

import back.models.Book;
import back.models.Order;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderDao extends JpaRepository<Order, Long> {
  List<Order> findByUserId(Long userId);

  @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.book.id = :bookId")
  Long countByBookId(@Param("bookId") Long bookId);

  @Query("SELECT oi.book FROM OrderItem oi JOIN oi.order o WHERE o.user.id = :userId")
  List<Book> findBooksByUser(@Param("userId") Long userId);
}


