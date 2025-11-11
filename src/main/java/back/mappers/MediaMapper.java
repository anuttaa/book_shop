package back.mappers;

import back.dto.MediaDTO;
import back.models.Media;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MediaMapper {
  MediaDTO toDTO(Media cartItem);
  Media toEntity(MediaDTO dto);
}
