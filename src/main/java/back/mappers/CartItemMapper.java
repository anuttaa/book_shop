package back.mappers;

import back.dto.CartItemDTO;
import back.models.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartItemMapper {
  @Mapping(target = "price", expression = "java(cartItem.getBook().getPrice() * cartItem.getQuantity())")
  CartItemDTO toDTO(CartItem cartItem);
  CartItem toEntity(CartItemDTO dto);
}

