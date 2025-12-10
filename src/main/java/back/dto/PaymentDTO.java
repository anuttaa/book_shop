package back.dto;

import back.enums.PaymentMethod;
import back.enums.PaymentStatus;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Data
public class PaymentDTO {
  private Long id;
  private Long orderId;
  private PaymentMethod method;
  private PaymentStatus status;
  private Double amount;
  private String currency;
  private String cardLast4;
  private String cardBrand;
  private String transactionId;
  private LocalDateTime paidAt;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}

