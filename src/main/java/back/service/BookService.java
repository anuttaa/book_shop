package back.service;

import back.dao.BookDao;
import back.dto.BookDTO;
import back.mappers.BookMapper;
import back.models.Book;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookService {

  private final BookDao bookRepository;
  private final BookMapper bookMapper;

  public List<BookDTO> getAllBooks() {
    return bookRepository.findAll()
      .stream()
      .map(this::enrichBookWithRating)
      .map(bookMapper::toDTO)
      .collect(Collectors.toList());
  }

  public BookDTO getBookById(Long id) {
    Book book = bookRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("Book not found"));
    enrichBookWithRating(book);
    return bookMapper.toDTO(book);
  }

  @Transactional
  public BookDTO createBook(BookDTO dto) {
    Book book = bookMapper.toEntity(dto);
    Book savedBook = bookRepository.save(book);
    return bookMapper.toDTO(savedBook);
  }

  @Transactional
  public BookDTO updateBook(Long id, BookDTO dto) {
    Book book = bookRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("Book not found"));

    book.setTitle(dto.getTitle());
    book.setAuthor(dto.getAuthor());
    book.setGenre(dto.getGenre());
    book.setDescription(dto.getDescription());
    book.setPrice(dto.getPrice());

    Book updatedBook = bookRepository.save(book);
    enrichBookWithRating(updatedBook);
    return bookMapper.toDTO(updatedBook);
  }

  @Transactional
  public void deleteBook(Long id) {
    bookRepository.deleteById(id);
  }

  public List<BookDTO> searchBooks(String title, String author, String genre) {
    if (title == null) title = "";
    if (author == null) author = "";
    if (genre == null) genre = "";

    return bookRepository
      .findByTitleContainingIgnoreCaseAndAuthorContainingIgnoreCaseAndGenreContainingIgnoreCase(
        title, author, genre)
      .stream()
      .map(this::enrichBookWithRating)
      .map(bookMapper::toDTO)
      .collect(Collectors.toList());
  }

  public List<BookDTO> getRecommendedBooks() {
    return bookRepository.findTop10ByOrderByCreatedAtDesc()
      .stream()
      .map(this::enrichBookWithRating)
      .map(bookMapper::toDTO)
      .collect(Collectors.toList());
  }

  public List<BookDTO> getPopularBooks() {
    return bookRepository.findTop10ByOrderByTimesAddedToCartDesc()
      .stream()
      .map(this::enrichBookWithRating)
      .map(bookMapper::toDTO)
      .collect(Collectors.toList());
  }

  public List<BookDTO> getTopRatedBooks() {
    return getAllBooks().stream()
      .filter(book -> book.getRating() > 0)
      .sorted((b1, b2) -> Double.compare(b2.getRating(), b1.getRating()))
      .limit(10)
      .collect(Collectors.toList());
  }

  private Book enrichBookWithRating(Book book) {
    if (book.getReviews() != null) {
      book.getReviews().size();
    }
    return book;
  }
}


