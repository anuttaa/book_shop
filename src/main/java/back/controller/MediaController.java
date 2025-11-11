package back.controller;

import back.dto.MediaDTO;
import back.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

  private final MediaService mediaService;

  @GetMapping("/book/{bookId}")
  public ResponseEntity<List<MediaDTO>> getMediaByBook(@PathVariable Long bookId) {
    return ResponseEntity.ok(mediaService.getMediaByBook(bookId));
  }

  @PostMapping("/book/{bookId}")
  public ResponseEntity<MediaDTO> addMedia(@PathVariable Long bookId, @RequestBody MediaDTO dto) {
    return ResponseEntity.ok(mediaService.addMedia(bookId, dto));
  }

  @DeleteMapping("/{mediaId}")
  public ResponseEntity<Void> deleteMedia(@PathVariable Long mediaId) {
    mediaService.deleteMedia(mediaId);
    return ResponseEntity.noContent().build();
  }
}

