package back.models;

import back.enums.PaymentMethod;
import back.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "payments")
public class Payment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "order_id", nullable = false, unique = true)
  private Order order;

  @Enumerated(EnumType.STRING)
  private PaymentMethod method = PaymentMethod.cash;

  @Enumerated(EnumType.STRING)
  private PaymentStatus status = PaymentStatus.pending;

  private Double amount;

  @Column(length = 3)
  private String currency = "RUB";

  @Column(name = "card_last4", length = 4)
  private String cardLast4;

  @Column(name = "card_brand", length = 20)
  private String cardBrand;

  @Column(name = "transaction_id")
  private String transactionId;

  @Lob
  @Column(name = "details")
  private String details;

  @Column(name = "paid_at")
  private LocalDateTime paidAt;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() { createdAt = LocalDateTime.now(); }

  @PreUpdate
  protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}

