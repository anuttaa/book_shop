package back.controller;

import back.dto.UserDTO;
import back.service.AdminService;
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
}
