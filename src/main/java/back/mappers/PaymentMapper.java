package back.mappers;

import back.dto.PaymentDTO;
import back.models.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
  @Mapping(source = "order.id", target = "orderId")
  PaymentDTO toDTO(Payment payment);
}

