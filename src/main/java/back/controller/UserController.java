package back.controller;

import back.dto.LoginRequest;
import back.dto.UserDTO;
import back.models.User;
import back.service.UserService;
import back.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

  private final UserService userService;
  private final JwtUtil jwtUtil;
  private final AuthenticationManager authManager;

  @PostMapping("/register")
  public ResponseEntity<UserDTO> register(@RequestBody UserDTO dto) {
    return ResponseEntity.ok(userService.registerUser(dto));
  }

  @PostMapping("/login")
  public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
    System.out.println("Login attempt: " + request.getUsername());
    Authentication auth = authManager.authenticate(
      new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
    );
    System.out.println("Auth successful: " + auth.isAuthenticated());
    String token = jwtUtil.generateToken((UserDetails) auth.getPrincipal());
    return ResponseEntity.ok(Map.of("token", token));
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
    return ResponseEntity.ok(userService.getUserById(id));
  }
}


