package back.controller;

import back.dto.LoginRequest;
import back.dto.UserDTO;
import back.models.User;
import back.service.AuthenticationService;
import back.service.UserService;
import back.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

  private final UserService userService;
  private final AuthenticationService authenticationService;
  private final JwtUtil jwtUtil;
  private final AuthenticationManager authManager;
  private final BCryptPasswordEncoder passwordEncoder;

  @PostMapping("/register")
  public ResponseEntity<UserDTO> register(@RequestBody UserDTO dto) {
    return ResponseEntity.ok(userService.registerUser(dto));
  }

  @PostMapping("/login")
  public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
    Authentication auth = authManager.authenticate(
      new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
    );
    String token = jwtUtil.generateToken((UserDetails) auth.getPrincipal());
    return ResponseEntity.ok(Map.of("token", token));
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
    return ResponseEntity.ok(userService.getUserById(id));
  }

  @GetMapping("/me")
  public ResponseEntity<UserDTO> getProfile() {
    Long userId = authenticationService.getCurrentUserId();
    return ResponseEntity.ok(userService.getUserById(userId));
  }

  @PutMapping("/me")
  public ResponseEntity<UserDTO> updateProfile(@RequestBody UserDTO dto) {
    Long userId = authenticationService.getCurrentUserId();
    UserDTO updated = userService.updateUser(userId, dto);
    return ResponseEntity.ok(updated);
  }

  @PostMapping("/me/change-password")
  public ResponseEntity<String> changePassword(@RequestBody Map<String, String> passwords) {
    Long userId = authenticationService.getCurrentUserId();
    String current = passwords.get("currentPassword");
    String newPass = passwords.get("newPassword");
    userService.changePassword(userId, current, newPass);
    return ResponseEntity.ok("Password updated successfully");
  }

  @GetMapping("/me/subscription")
  public ResponseEntity<Map<String, Boolean>> getSubscription() {
    Long userId = authenticationService.getCurrentUserId();
    boolean subscribed = userService.isSubscribed(userId);
    return ResponseEntity.ok(Map.of("subscribed", subscribed));
  }

  @PutMapping("/me/subscription")
  public ResponseEntity<String> updateSubscription(@RequestBody Map<String, Boolean> body) {
    Long userId = authenticationService.getCurrentUserId();
    boolean subscribed = body.getOrDefault("subscribed", false);
    userService.updateSubscription(userId, subscribed);
    return ResponseEntity.ok("Subscription updated");
  }

  @DeleteMapping("/me")
  public ResponseEntity<String> deleteAccount() {
    Long userId = authenticationService.getCurrentUserId();
    userService.deleteUser(userId);
    return ResponseEntity.ok("Account deleted successfully");
  }

  @GetMapping("/admin/all")
  public ResponseEntity<List<UserDTO>> getAllUsers() {
    return ResponseEntity.ok(userService.getAllUsers());
  }

  @PostMapping("/admin")
  public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO dto) {
    return ResponseEntity.ok(userService.createUser(dto));
  }

  @PutMapping("/admin/{userId}")
  public ResponseEntity<UserDTO> updateUser(@PathVariable Long userId, @RequestBody UserDTO dto) {
    return ResponseEntity.ok(userService.updateUser(userId, dto));
  }

  @DeleteMapping("/admin/{userId}")
  public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
    userService.deleteUser(userId);
    return ResponseEntity.ok("User deleted successfully");
  }

  @PutMapping("/admin/{userId}/role")
  public ResponseEntity<UserDTO> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> roleUpdate) {
    String newRole = roleUpdate.get("role");
    UserDTO user = userService.getUserById(userId);
    user.setRole(newRole);
    return ResponseEntity.ok(userService.updateUser(userId, user));
  }

  @PutMapping("/admin/{userId}/block")
  public ResponseEntity<UserDTO> blockUser(@PathVariable Long userId) {
    UserDTO blockedUser = userService.blockUser(userId);
    return ResponseEntity.ok(blockedUser);
  }

  @PutMapping("/admin/{userId}/unblock")
  public ResponseEntity<UserDTO> unblockUser(@PathVariable Long userId) {
    UserDTO unblockedUser = userService.unblockUser(userId);
    return ResponseEntity.ok(unblockedUser);
  }

  @PostMapping("/admin/{userId}/reset-password")
  public ResponseEntity<String> resetPassword(@PathVariable Long userId, @RequestBody Map<String, String> passwordData) {
    String newPassword = passwordData.get("newPassword");
    User user = userService.getUserEntityById(userId);
    user.setPasswordHash(passwordEncoder.encode(newPassword));
    userService.saveUser(user);
    return ResponseEntity.ok("Password reset successfully");
  }

  @GetMapping("/admin/{userId}")
  public ResponseEntity<UserDTO> getUserForAdmin(@PathVariable Long userId) {
    return ResponseEntity.ok(userService.getUserById(userId));
  }

  @PutMapping("/admin/{userId}/subscription")
  public ResponseEntity<String> updateUserSubscription(@PathVariable Long userId, @RequestBody Map<String, Boolean> body) {
    boolean subscribed = body.getOrDefault("subscribed", false);
    userService.updateSubscription(userId, subscribed);
    return ResponseEntity.ok("User subscription updated");
  }
}



