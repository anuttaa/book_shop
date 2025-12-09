package back.controller;

import back.dao.UserDao;
import back.models.User;
import back.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/newsletter")
@RequiredArgsConstructor
public class AdminMailController {

  private final UserDao userDao;
  private final EmailService emailService;

  public static class NewsletterRequest {
    public String subject;
    public String content;
  }

  @PostMapping("/send")
  public ResponseEntity<Void> sendNewsletter(@RequestBody NewsletterRequest request) {
    List<User> recipients = userDao.findBySubscribedTrue();
    for (User user : recipients) {
      emailService.sendNewsletter(user, request.subject, request.content);
    }
    return ResponseEntity.accepted().build();
  }
}

