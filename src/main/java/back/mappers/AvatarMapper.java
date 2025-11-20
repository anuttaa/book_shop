package back.mappers;

import back.dto.AvatarDTO;
import back.models.Media;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AvatarMapper {

  AvatarDTO toDTO(Media media);

  Media toEntity(AvatarDTO dto);
}