package back.mappers;

import back.dto.OrderItemDTO;
import back.models.OrderItem;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = BookMapper.class)
public interface OrderItemMapper {

  OrderItemDTO toDTO(OrderItem orderItem);

  OrderItem toEntity(OrderItemDTO orderItemDTO);

  List<OrderItemDTO> toDTOList(List<OrderItem> orderItems);

  List<OrderItem> toEntityList(List<OrderItemDTO> orderItemDTOs);
}
