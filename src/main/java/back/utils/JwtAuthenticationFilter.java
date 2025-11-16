package back.utils;

import back.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtUtil jwtUtil;
  private final UserService userService;

  public JwtAuthenticationFilter(JwtUtil jwtUtil, UserService userService) {
    this.jwtUtil = jwtUtil;
    this.userService = userService;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {

    final String requestPath = request.getServletPath();
    final String method = request.getMethod();

    if (isPublicEndpoint(requestPath, method)) {
      filterChain.doFilter(request, response);
      return;
    }

    final String authHeader = request.getHeader("Authorization");
    System.out.println("AuthHeader = " + authHeader);

    String username = null;
    String token = null;

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
      try {
        username = jwtUtil.extractUsername(token);
        System.out.println("Username from token = " + username);
      } catch (Exception e) {
        System.out.println("Invalid token: " + e.getMessage());
        sendErrorResponse(response, "Invalid token");
        return;
      }
    }

    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
      try {
        UserDetails userDetails = userService.loadUserByUsername(username);
        System.out.println("UserDetails = " + userDetails);

        if (jwtUtil.validateToken(token, userDetails)) {
          System.out.println("Token validated successfully");
          UsernamePasswordAuthenticationToken authToken =
            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
          authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authToken);
        } else {
          System.out.println("Token not valid!");
          sendErrorResponse(response, "Token expired or invalid");
          return;
        }
      } catch (UsernameNotFoundException e) {
        System.out.println("User not found: " + username);
        sendErrorResponse(response, "User not found");
        return;
      }
    } else if (username == null) {
      System.out.println("No JWT token provided for protected endpoint: " + requestPath);
      sendErrorResponse(response, "Authentication required");
      return;
    }

    filterChain.doFilter(request, response);
  }

  private boolean isPublicEndpoint(String path, String method) {

    if (path.startsWith("/pages/") ||
      path.startsWith("/css/") ||
      path.startsWith("/js/") ||
      path.startsWith("/images/") ||
      path.equals("/") ||
      path.equals("/favicon.ico") ||
      path.equals("/login") ||
      path.equals("/register") ||
      path.equals("/login.html") ||
      path.equals("/register.html")) {
      return true;
    }

    if (path.equals("/api/books") || path.startsWith("/api/books/")) {
      return true;
    }

    if (path.startsWith("/api/media/")) {
      return true;
    }

    if (path.startsWith("/api/reviews/")) {
      return true;
    }

    if (path.startsWith("/api/users")) {
      return true;
    }

    if (path.equals("/login") || path.equals("/register") ||
      path.equals("/catalog") || path.equals("/cart") ||
      path.equals("/wishlist") || path.equals("/orders")) {
      return true;
    }

    return ("/api/users/register".equals(path) && "POST".equalsIgnoreCase(method)) ||
      ("/api/users/login".equals(path) && "POST".equalsIgnoreCase(method));
  }

  private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType("application/json");
    response.getWriter().write("{\"error\": \"" + message + "\"}");
  }
}




