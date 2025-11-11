package back.mappers;

import back.dto.CartItemDTO;
import back.models.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartItemMapper {

  @Mapping(source = "book.id", target = "bookId")
  @Mapping(source = "book.title", target = "bookTitle")
  CartItemDTO toDTO(CartItem cartItem);

  @Mapping(source = "bookId", target = "book.id")
  CartItem toEntity(CartItemDTO dto);
}
