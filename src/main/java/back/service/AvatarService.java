package back.service;

import back.dao.MediaDao;
import back.dao.UserDao;
import back.dto.AvatarDTO;
import back.dto.MediaDTO;
import back.enums.FileType;
import back.mappers.MediaMapper;
import back.models.Media;
import back.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AvatarService {

  private final UserDao userRepository;
  private final MediaDao mediaRepository;
  private final MediaMapper mediaMapper;

  public AvatarDTO getAvatar(Long userId) {
    try {

      User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

      Media avatarMedia = user.getAvatarMedia();

      if (avatarMedia == null) {
        return createEmptyAvatarDTO();
      }


      MediaDTO mediaDTO = mediaMapper.toDTO(avatarMedia);

      AvatarDTO avatarDTO = convertToAvatarDTO(mediaDTO);

      return avatarDTO;

    } catch (Exception e) {
      return createEmptyAvatarDTO();
    }
  }

  @Transactional
  public AvatarDTO setAvatar(Long userId, String avatarUrl, String fileName) {
    try {
      User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

      if (user.getAvatarMedia() != null) {
        mediaRepository.delete(user.getAvatarMedia());
        user.setAvatarMedia(null);
      }

      Media avatar = new Media();
      avatar.setFileType(FileType.image);
      avatar.setFileName(fileName != null ? fileName : generateFileName());
      avatar.setFileUrl(avatarUrl);

      Media savedAvatar = mediaRepository.save(avatar);

      user.setAvatarMedia(savedAvatar);
      userRepository.save(user);

      MediaDTO mediaDTO = mediaMapper.toDTO(savedAvatar);
      return convertToAvatarDTO(mediaDTO);

    } catch (Exception e) {
      throw new RuntimeException("Failed to set avatar: " + e.getMessage(), e);
    }
  }

  @Transactional
  public void deleteAvatar(Long userId) {
    try {
      User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

      if (user.getAvatarMedia() != null) {
        mediaRepository.delete(user.getAvatarMedia());
        user.setAvatarMedia(null);
        userRepository.save(user);
      }
    } catch (Exception e) {
      throw new RuntimeException("Failed to delete avatar: " + e.getMessage(), e);
    }
  }

  private AvatarDTO convertToAvatarDTO(MediaDTO mediaDTO) {
    AvatarDTO avatarDTO = new AvatarDTO();
    avatarDTO.setId(mediaDTO.getId());
    avatarDTO.setFileUrl(mediaDTO.getFileUrl());
    avatarDTO.setFileName(mediaDTO.getFileName());

    if (mediaDTO.getFileType() != null) {
      avatarDTO.setFileType(mediaDTO.getFileType().name());
    }

    return avatarDTO;
  }

  private AvatarDTO createEmptyAvatarDTO() {
    AvatarDTO empty = new AvatarDTO();
    empty.setFileUrl(null);
    empty.setFileName(null);
    empty.setFileType(null);
    return empty;
  }

  private String generateFileName() {
    return "avatar_" + UUID.randomUUID() + ".jpg";
  }
}
