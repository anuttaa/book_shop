package back.controller;

import back.dto.UserDTO;
import back.service.AdminService;
import back.service.EmailService;
import back.dao.UserDao;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

  private final AdminService adminService;
  private final EmailService emailService;
  private final UserDao userDao;

  @GetMapping("/users")
  public ResponseEntity<List<UserDTO>> getAllUsers() {
    return ResponseEntity.ok(adminService.getAllUsers());
  }

  @PostMapping("/users/{id}/block")
  public ResponseEntity<Void> blockUser(@PathVariable Long id) {
    adminService.blockUser(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/sales")
  public ResponseEntity<Map<String, Long>> getSalesStatistics() {
    return ResponseEntity.ok(adminService.getSalesStatistics());
  }

  @PostMapping("/newsletter")
  public ResponseEntity<Map<String, Object>> sendNewsletter(@RequestBody Map<String, String> body) {
    String subject = body.getOrDefault("subject", "Новости BookShop");
    String content = body.getOrDefault("content", "");

    List<back.models.User> recipients = userDao.findBySubscribedTrue();
    int attempted = 0;
    for (back.models.User u : recipients) {
      attempted++;
      emailService.sendNewsletter(u, subject, content);
    }
    return ResponseEntity.ok(Map.of(
      "recipients", recipients.size(),
      "attempted", attempted
    ));
  }
}
