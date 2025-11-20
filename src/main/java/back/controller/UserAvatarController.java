package back.controller;

import back.dto.AvatarDTO;
import back.service.AvatarService;
import back.service.AuthenticationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserAvatarController {

  private final AvatarService avatarService;
  private final AuthenticationService authenticationService;

  @GetMapping("/me/avatar")
  public ResponseEntity<AvatarDTO> getMyAvatar() {
    Long userId = authenticationService.getCurrentUserId();
    AvatarDTO avatar = avatarService.getAvatar(userId);
    return ResponseEntity.ok(avatar);
  }

  @GetMapping("/{userId}/avatar")
  public ResponseEntity<AvatarDTO> getUserAvatar(@PathVariable Long userId) {
    AvatarDTO avatar = avatarService.getAvatar(userId);
    return ResponseEntity.ok(avatar);
  }

  @PutMapping("/me/avatar")
  public ResponseEntity<AvatarDTO> setMyAvatar(@RequestBody SetAvatarRequest request) {
    Long userId = authenticationService.getCurrentUserId();
    AvatarDTO avatar = avatarService.setAvatar(userId, request.getAvatarUrl(), request.getFileName());
    return ResponseEntity.ok(avatar);
  }

  @DeleteMapping("/me/avatar")
  public ResponseEntity<Void> deleteMyAvatar() {
    Long userId = authenticationService.getCurrentUserId();
    avatarService.deleteAvatar(userId);
    return ResponseEntity.noContent().build();
  }

  @Data
  public static class SetAvatarRequest {
    private String avatarUrl;
    private String fileName;
  }
}