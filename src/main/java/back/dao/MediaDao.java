package back.dao;

import back.models.Media;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface MediaDao extends JpaRepository<Media, Long> {
  List<Media> findByBookId(Long bookId);
}

