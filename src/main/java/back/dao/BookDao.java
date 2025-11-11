package back.dao;

import back.models.Book;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookDao extends JpaRepository<Book, Long> {
  List<Book> findByGenre(String genre);
  List<Book> findByAuthor(String author);
}


