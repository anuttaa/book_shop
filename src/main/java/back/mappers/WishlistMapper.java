package back.mappers;

import back.dto.WishlistDTO;
import back.models.Wishlist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = BookMapper.class)
public interface WishlistMapper {

  @Mapping(source = "user.id", target = "userId")
  @Mapping(source = "book", target = "book")
  WishlistDTO toDTO(Wishlist wishlist);

  @Mapping(source = "userId", target = "user.id")
  @Mapping(source = "book", target = "book")
  Wishlist toEntity(WishlistDTO dto);
}


