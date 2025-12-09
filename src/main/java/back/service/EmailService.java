package back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import back.models.Order;
import back.models.User;

@Service
@RequiredArgsConstructor
public class EmailService {

  private final JavaMailSender mailSender;
  @Value("${spring.mail.username:}")
  private String fromAddress;
  @Value("${spring.mail.host:}")
  private String mailHost;
  @Value("${spring.mail.port:}")
  private String mailPort;
  @Value("${spring.mail.username:}")
  private String mailUsername;

  public void sendOrderDelivered(User user, Order order) {
    if (user == null || user.getEmail() == null || Boolean.FALSE.equals(user.getSubscribed())) {
      return;
    }
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(user.getEmail());
    if (fromAddress != null && !fromAddress.isBlank()) {
      message.setFrom(fromAddress);
    }
    message.setSubject("Ваш заказ доставлен");
    message.setText("Здравствуйте, " + user.getUsername() + 
      "! Ваш заказ №" + order.getId() + " был доставлен. Спасибо, что выбираете наш магазин!");
    try { mailSender.send(message); } catch (Exception ignored) {}
  }

  public void sendOrderShipped(User user, Order order) {
    if (user == null || user.getEmail() == null || Boolean.FALSE.equals(user.getSubscribed())) {
      return;
    }
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(user.getEmail());
    if (fromAddress != null && !fromAddress.isBlank()) {
      message.setFrom(fromAddress);
    }
    message.setSubject("Ваш заказ отправлен");
    message.setText("Здравствуйте, " + user.getUsername() + 
      "! Ваш заказ №" + order.getId() + " отправлен и находится в пути.");
    try { mailSender.send(message); } catch (Exception ignored) {}
  }

  public void sendNewsletter(User user, String subject, String content) {
    if (user == null || user.getEmail() == null || Boolean.FALSE.equals(user.getSubscribed())) {
      return;
    }
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(user.getEmail());
    if (fromAddress != null && !fromAddress.isBlank()) {
      message.setFrom(fromAddress);
    }
    message.setSubject(subject);
    message.setText(content);
    try { mailSender.send(message); } catch (Exception ignored) {}
  }

  public void sendOrderStatusUpdate(User user, Order order) {
    if (user == null || user.getEmail() == null || Boolean.FALSE.equals(user.getSubscribed())) {
      return;
    }
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(user.getEmail());
    if (fromAddress != null && !fromAddress.isBlank()) {
      message.setFrom(fromAddress);
    }
    String statusRu = toRussianStatus(order.getStatus());
    message.setSubject("Статус вашего заказа обновлён");
    message.setText("Здравствуйте, " + user.getUsername() +
      "! Статус вашего заказа №" + order.getId() + " теперь: " + statusRu + ".");
    try { mailSender.send(message); } catch (Exception ignored) {}
  }

  private String toRussianStatus(back.enums.OrderStatus status) {
    if (status == null) return "обновлён";
    switch (status) {
      case created: return "создан";
      case paid: return "оплачен";
      case shipped: return "отправлен";
      case completed: return "доставлен";
      case cancelled: return "отменён";
      default: return "обновлён";
    }
  }

  public boolean sendTestMail(User user) {
    if (user == null || user.getEmail() == null || Boolean.FALSE.equals(user.getSubscribed())) {
      return false;
    }
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(user.getEmail());
    if (fromAddress != null && !fromAddress.isBlank()) {
      message.setFrom(fromAddress);
    }
    message.setSubject("Тестовое письмо");
    message.setText("Это тестовое письмо из BookShop. Если вы видите его — SMTP настроен корректно.");
    try {
      mailSender.send(message);
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  public java.util.Map<String, Object> getMailConfigDiagnostics(User user) {
    boolean subscribed = user != null && Boolean.TRUE.equals(user.getSubscribed());
    boolean hasHost = mailHost != null && !mailHost.isBlank();
    boolean hasPort = mailPort != null && !mailPort.isBlank();
    boolean hasUser = mailUsername != null && !mailUsername.isBlank();
    String from = (fromAddress != null && !fromAddress.isBlank()) ? fromAddress : "";
    String maskedUser = hasUser ? maskEmail(mailUsername) : "";
    java.util.Map<String, Object> result = new java.util.HashMap<>();
    result.put("subscribed", subscribed);
    result.put("hostConfigured", hasHost);
    result.put("portConfigured", hasPort);
    result.put("usernameConfigured", hasUser);
    result.put("fromAddress", from);
    result.put("maskedUsername", maskedUser);
    return result;
  }

  private String maskEmail(String email) {
    int at = email.indexOf('@');
    if (at <= 1) return "***";
    String name = email.substring(0, at);
    String domain = email.substring(at + 1);
    String maskedName = name.charAt(0) + "***" + name.charAt(name.length() - 1);
    return maskedName + "@" + domain;
  }
}
