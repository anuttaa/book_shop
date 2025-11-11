package back.dao;

import back.models.CartItem;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface CartItemDao extends JpaRepository<CartItem, Long> {
  List<CartItem> findByUserId(Long userId);
}


