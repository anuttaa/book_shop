package back.service;
import back.dao.BookDao;
import back.dao.MediaDao;
import back.dto.MediaDTO;
import back.mappers.MediaMapper;
import back.models.Book;
import back.models.Media;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MediaService {

  private final MediaDao mediaDao;
  private final BookDao bookDao;
  private final MediaMapper mediaMapper;

  public List<MediaDTO> getMediaByBook(Long bookId) {
    return mediaDao.findByBookId(bookId).stream()
      .map(mediaMapper::toDTO)
      .collect(Collectors.toList());
  }

  public MediaDTO addMedia(Long bookId, MediaDTO dto) {
    Book book = bookDao.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found"));

    Media media = mediaMapper.toEntity(dto);
    media.setBook(book);

    return mediaMapper.toDTO(mediaDao.save(media));
  }

  public void deleteMedia(Long mediaId) {
    mediaDao.deleteById(mediaId);
  }
}

