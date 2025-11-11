package back.mappers;

import back.dto.OrderDTO;
import back.models.Order;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = CartItemMapper.class)
public interface OrderMapper {
  OrderDTO toDTO(Order order);
  Order toEntity(OrderDTO dto);
}

