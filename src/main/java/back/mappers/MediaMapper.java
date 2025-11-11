package back.mappers;

import back.dto.MediaDTO;
import back.models.Media;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MediaMapper {
  @Mapping(source = "book.id", target = "bookId")
  MediaDTO toDTO(Media media);
  @Mapping(source = "bookId", target = "book.id")
  Media toEntity(MediaDTO dto);
}

