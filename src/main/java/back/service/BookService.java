package back.service;

import back.dao.*;
import back.dto.BookDTO;
import back.enums.Role;
import back.mappers.BookMapper;
import back.models.Book;
import back.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookService {

  private final BookDao bookRepository;
  private final BookMapper bookMapper;
  private final OrderDao orderRepository;
  private final WishlistDao wishlistRepository;
  private final ReviewDao reviewRepository;

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
    if (dto.getType() != null) {
      book.setType(dto.getType());
    }

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

  public List<BookDTO> getRecommendedBooks(User user) {
    if (user != null && user.getRole() != Role.guest) {
      List<BookDTO> personalized = getPersonalizedRecommendations(user);

      if (personalized.size() < 5) {
        List<BookDTO> defaultRecs = getDefaultRecommendedBooks();
        Set<Long> personalizedIds = personalized.stream()
          .map(BookDTO::getId)
          .collect(Collectors.toSet());

        List<BookDTO> additional = defaultRecs.stream()
          .filter(book -> !personalizedIds.contains(book.getId()))
          .limit(10 - personalized.size())
          .collect(Collectors.toList());

        personalized.addAll(additional);
      }

      return personalized.stream().limit(15).collect(Collectors.toList());
    } else {
      return getDefaultRecommendedBooks();
    }
  }

  public List<BookDTO> getPopularBooks(User user) {
    if (user != null && user.getRole() != Role.guest) {
      return getPersonalizedPopularBooks(user);
    } else {
      return getDefaultPopularBooks();
    }
  }

  public List<BookDTO> getTopRatedBooks() {
    return bookRepository.findTop15ByOrderByCreatedAtDesc()
      .stream()
      .map(this::enrichBookWithRating)
      .filter(book -> book.getRating() > 0)
      .sorted((b1, b2) -> Double.compare(b2.getRating(), b1.getRating()))
      .limit(15)
      .map(bookMapper::toDTO)
      .collect(Collectors.toList());
  }

  private List<BookDTO> getPersonalizedRecommendations(User user) {
    try {
      List<BookDTO> recommendations = new ArrayList<>();
      List<BookDTO> genreRecommendations = getGenreBasedRecommendations(user);
      recommendations.addAll(genreRecommendations);
      List<BookDTO> authorRecommendations = getAuthorBasedRecommendations(user);
      recommendations.addAll(authorRecommendations);
      List<BookDTO> wishlistRecommendations = getWishlistBasedRecommendations(user);
      recommendations.addAll(wishlistRecommendations);
      List<BookDTO> similarUsersRecommendations = getSimilarUsersRecommendations(user);
      recommendations.addAll(similarUsersRecommendations);
      List<BookDTO> finalRecommendations = removeDuplicatesAndLimit(recommendations, 15);
      return finalRecommendations;
    } catch (Exception e) {
      return getDefaultRecommendedBooks();
    }
  }

  private List<BookDTO> getGenreBasedRecommendations(User user) {
    try {
      List<Object[]> favoriteGenres = bookRepository.findUserFavoriteGenres(user.getId());
      if (favoriteGenres.isEmpty()) {
        return getDefaultRecommendedBooks().stream().limit(5).collect(Collectors.toList());
      }

      List<String> topGenres = favoriteGenres.stream()
        .limit(3)
        .map(obj -> (String) obj[0])
        .collect(Collectors.toList());

      List<Book> genreBooks = bookRepository.findBooksByGenresExcludingUserBooks(
        topGenres, user.getId(), 8
      );
      if (genreBooks.isEmpty() && !topGenres.isEmpty()) {
        genreBooks = bookRepository.findByGenreContainingIgnoreCase(topGenres.get(0))
          .stream()
          .limit(8)
          .collect(Collectors.toList());
      }

      List<Book> wishlistBooks = wishlistRepository.findBooksByUser(user.getId());
      Set<Long> wishlistBookIds = wishlistBooks.stream()
        .map(Book::getId)
        .collect(Collectors.toSet());

      List<Book> filteredBooks = genreBooks.stream()
        .filter(book -> !wishlistBookIds.contains(book.getId()))
        .collect(Collectors.toList());

      return filteredBooks.stream()
        .map(this::enrichBookWithRating)
        .map(bookMapper::toDTO)
        .collect(Collectors.toList());

    } catch (Exception e) {
      return new ArrayList<>();
    }
  }
  private List<BookDTO> getAuthorBasedRecommendations(User user) {
    try {
      List<Object[]> favoriteAuthors = bookRepository.findUserFavoriteAuthors(user.getId());
      List<String> topAuthors = favoriteAuthors.stream()
        .limit(3)
        .map(obj -> (String) obj[0])
        .collect(Collectors.toList());

      if (!topAuthors.isEmpty()) {
        List<Book> authorBooks = bookRepository.findBooksByAuthorsExcludingUserBooks(
          topAuthors, user.getId(), 8
        );

        List<Book> wishlistBooks = wishlistRepository.findBooksByUser(user.getId());
        Set<Long> wishlistBookIds = wishlistBooks.stream()
          .map(Book::getId)
          .collect(Collectors.toSet());

        List<Book> filteredBooks = authorBooks.stream()
          .filter(book -> !wishlistBookIds.contains(book.getId()))
          .collect(Collectors.toList());

        return filteredBooks.stream()
          .map(this::enrichBookWithRating)
          .map(bookMapper::toDTO)
          .collect(Collectors.toList());
      }
    } catch (Exception e) {
    }

    return new ArrayList<>();
  }

  private List<BookDTO> getWishlistBasedRecommendations(User user) {
    try {
      List<Book> wishlistBooks = wishlistRepository.findBooksByUser(user.getId());

      if (!wishlistBooks.isEmpty()) {
        Set<String> wishlistGenres = wishlistBooks.stream()
          .map(Book::getGenre)
          .collect(Collectors.toSet());

        Set<String> wishlistAuthors = wishlistBooks.stream()
          .map(Book::getAuthor)
          .filter(Objects::nonNull)
          .collect(Collectors.toSet());

        List<Book> genreRecommendations = new ArrayList<>();
        if (!wishlistGenres.isEmpty()) {
          genreRecommendations = bookRepository.findBooksByGenresExcludingUserBooks(
            new ArrayList<>(wishlistGenres), user.getId(), 5
          );
        }

        List<Book> authorRecommendations = new ArrayList<>();
        if (!wishlistAuthors.isEmpty()) {
          authorRecommendations = bookRepository.findBooksByAuthorsExcludingUserBooks(
            new ArrayList<>(wishlistAuthors), user.getId(), 5
          );
        }

        List<Book> allRecommendations = new ArrayList<>();
        allRecommendations.addAll(genreRecommendations);
        allRecommendations.addAll(authorRecommendations);

        Set<Long> wishlistBookIds = wishlistBooks.stream()
          .map(Book::getId)
          .collect(Collectors.toSet());

        List<Book> filteredRecommendations = allRecommendations.stream()
          .filter(book -> !wishlistBookIds.contains(book.getId()))
          .collect(Collectors.toList());

        return filteredRecommendations.stream()
          .map(this::enrichBookWithRating)
          .map(bookMapper::toDTO)
          .collect(Collectors.toList());
      }
    } catch (Exception e) {
    }

    return new ArrayList<>();
  }

  private List<BookDTO> getSimilarUsersRecommendations(User user) {
    try {
      List<Book> similarUsersBooks = bookRepository.findBooksFromSimilarUsers(user.getId(), 10);

      return similarUsersBooks.stream()
        .map(this::enrichBookWithRating)
        .map(bookMapper::toDTO)
        .collect(Collectors.toList());
    } catch (Exception e) {
      return new ArrayList<>();
    }
  }

  private List<BookDTO> getPersonalizedPopularBooks(User user) {
    try {
      List<BookDTO> personalizedPopular = new ArrayList<>();

      List<Object[]> favoriteGenres = bookRepository.findUserFavoriteGenres(user.getId());
      if (!favoriteGenres.isEmpty()) {
        List<String> topGenres = favoriteGenres.stream()
          .limit(2)
          .map(obj -> (String) obj[0])
          .collect(Collectors.toList());

        List<Book> genrePopular = bookRepository.findBooksByGenresExcludingUserBooks(
          topGenres, user.getId(), 10
        );
        personalizedPopular.addAll(genrePopular.stream()
          .map(this::enrichBookWithRating)
          .map(bookMapper::toDTO)
          .collect(Collectors.toList()));
      }

      if (personalizedPopular.size() < 15) {
        List<BookDTO> defaultPopular = getDefaultPopularBooks();
        Set<Long> addedBookIds = personalizedPopular.stream()
          .map(BookDTO::getId)
          .collect(Collectors.toSet());

        List<BookDTO> additionalBooks = defaultPopular.stream()
          .filter(book -> !addedBookIds.contains(book.getId()))
          .limit(15 - personalizedPopular.size())
          .collect(Collectors.toList());

        personalizedPopular.addAll(additionalBooks);
      }

      return personalizedPopular.stream().limit(15).collect(Collectors.toList());

    } catch (Exception e) {
      return getDefaultPopularBooks();
    }
  }

  private List<BookDTO> getDefaultRecommendedBooks() {
    return bookRepository.findTop15ByOrderByCreatedAtDesc()
      .stream()
      .map(this::enrichBookWithRating)
      .map(bookMapper::toDTO)
      .collect(Collectors.toList());
  }

  private List<BookDTO> getDefaultPopularBooks() {
    return bookRepository.findTop15ByOrderByTimesAddedToCartDesc()
      .stream()
      .map(this::enrichBookWithRating)
      .map(bookMapper::toDTO)
      .collect(Collectors.toList());
  }

  private List<BookDTO> removeDuplicatesAndLimit(List<BookDTO> books, int limit) {
    return books.stream()
      .distinct()
      .limit(limit)
      .collect(Collectors.toList());
  }

  private Book enrichBookWithRating(Book book) {
    if (book.getReviews() != null) {
      book.getReviews().size();
    }
    return book;
  }
}
