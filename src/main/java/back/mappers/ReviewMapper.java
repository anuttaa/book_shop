package back.mappers;

import back.dto.ReviewDTO;
import back.models.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

  @Mapping(source = "user.username", target = "username")
  @Mapping(source = "user.id", target = "userId")
  @Mapping(source = "book.id", target = "bookId")
  ReviewDTO toDTO(Review review);

  @Mapping(source = "userId", target = "user.id")
  @Mapping(source = "bookId", target = "book.id")
  Review toEntity(ReviewDTO dto);
}


