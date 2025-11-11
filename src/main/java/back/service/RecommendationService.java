package back.service;

import back.dao.BookDao;
import back.dao.ReviewDao;
import back.dto.BookDTO;
import back.mappers.BookMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

  private final ReviewDao reviewDao;
  private final BookDao bookDao;
  private final BookMapper bookMapper;

  public List<BookDTO> getRecommendations(Long userId) {
    String favoriteGenre = reviewDao
      .findFavoriteGenresByUser(userId, PageRequest.of(0, 1))
      .stream()
      .findFirst()
      .orElse(null);

    if (favoriteGenre == null) {
      return List.of();
    }

    return bookDao.findByGenre(favoriteGenre)
      .stream()
      .map(bookMapper::toDTO)
      .collect(Collectors.toList());
  }
}


