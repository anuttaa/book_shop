package back.service;

import back.dao.BookDao;
import back.dto.BookDTO;
import back.mappers.BookMapper;
import back.models.Book;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {

  private final BookDao bookRepository;
  private final BookMapper bookMapper;

  public List<BookDTO> getAllBooks() {
    return bookRepository.findAll()
      .stream()
      .map(bookMapper::toDTO)
      .collect(Collectors.toList());
  }

  public BookDTO getBookById(Long id) {
    Book book = bookRepository.findById(id).orElseThrow(() -> new RuntimeException("Book not found"));
    return bookMapper.toDTO(book);
  }

  public BookDTO createBook(BookDTO dto) {
    Book book = bookMapper.toEntity(dto);
    return bookMapper.toDTO(bookRepository.save(book));
  }

  public BookDTO updateBook(Long id, BookDTO dto) {
    Book book = bookRepository.findById(id).orElseThrow(() -> new RuntimeException("Book not found"));
    book.setTitle(dto.getTitle());
    book.setAuthor(dto.getAuthor());
    book.setGenre(dto.getGenre());
    book.setDescription(dto.getDescription());
    book.setPrice(dto.getPrice());
    return bookMapper.toDTO(bookRepository.save(book));
  }

  public void deleteBook(Long id) {
    bookRepository.deleteById(id);
  }
}


