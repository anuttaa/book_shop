package back.config;

import back.dao.UserDao;
import back.enums.Role;
import back.models.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BootstrapAdminConfig {

  @Value("${bootstrap.admin.email:}")
  private String adminEmail;

  @Value("${bootstrap.admin.subscribe:true}")
  private boolean subscribe;

  @Bean
  CommandLineRunner makeAdmin(UserDao userDao) {
    return args -> {
      if (adminEmail != null && !adminEmail.isBlank()) {
        userDao.findByEmail(adminEmail).ifPresent(user -> {
          user.setRole(Role.admin);
          user.setSubscribed(subscribe);
          userDao.save(user);
        });
      }
    };
  }
}

