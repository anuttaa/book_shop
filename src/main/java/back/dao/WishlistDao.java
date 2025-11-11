package back.dao;

import back.models.Wishlist;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface WishlistDao extends JpaRepository<Wishlist, Long> {
  List<Wishlist> findByUserId(Long userId);
}


