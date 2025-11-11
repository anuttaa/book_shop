package back.dao;

import back.models.CartItem;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemDao extends JpaRepository<CartItem, Long> {
  List<CartItem> findByUserId(Long userId);
  Optional<CartItem> findByUserIdAndBookId(Long userId, Long bookId);
  void deleteByUserIdAndBookId(Long userId, Long bookId);
  void deleteByUserId(Long userId);
}


