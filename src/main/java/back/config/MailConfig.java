package back.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class MailConfig {

  @Value("${spring.mail.host:}")
  private String host;

  @Value("${spring.mail.port:0}")
  private int port;

  @Value("${spring.mail.username:}")
  private String username;

  @Value("${spring.mail.password:}")
  private String password;

  @Value("${spring.mail.properties.mail.smtp.auth:true}")
  private boolean smtpAuth;

  @Value("${spring.mail.properties.mail.smtp.starttls.enable:true}")
  private boolean starttls;

  @Bean
  @ConditionalOnMissingBean(JavaMailSender.class)
  public JavaMailSender javaMailSender() {
    JavaMailSenderImpl sender = new JavaMailSenderImpl();
    if (host != null && !host.isBlank()) {
      sender.setHost(host);
    }
    if (port > 0) {
      sender.setPort(port);
    }
    if (username != null && !username.isBlank()) {
      sender.setUsername(username);
    }
    if (password != null && !password.isBlank()) {
      sender.setPassword(password);
    }
    sender.setDefaultEncoding("UTF-8");
    java.util.Properties props = sender.getJavaMailProperties();
    props.put("mail.transport.protocol", "smtp");
    props.put("mail.smtp.auth", String.valueOf(smtpAuth));
    props.put("mail.smtp.starttls.enable", String.valueOf(starttls));
    if (host != null && !host.isBlank()) {
      props.put("mail.smtp.ssl.trust", host);
    }
    return sender;
  }
}

