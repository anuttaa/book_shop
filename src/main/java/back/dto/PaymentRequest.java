package back.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class PaymentRequest {
  private Long orderId;
  private String method;
  private Double amount;
  private String currency;
  private String cardNumber;
  private String cardBrand;
  private String details;
}

