package back.dao;

import back.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentDao extends JpaRepository<Payment, Long> {
  Optional<Payment> findByOrderId(Long orderId);
}

