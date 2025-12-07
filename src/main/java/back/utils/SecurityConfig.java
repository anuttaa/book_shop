package back.utils;

import back.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthFilter;
  private final UserService userService;
  private final BCryptPasswordEncoder passwordEncoder;

  public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                        UserService userService,
                        BCryptPasswordEncoder passwordEncoder) {
    this.jwtAuthFilter = jwtAuthFilter;
    this.userService = userService;
    this.passwordEncoder = passwordEncoder;
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .csrf(AbstractHttpConfigurer::disable)
      .sessionManagement(session -> session
        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      // allow anonymous users so permitAll endpoints are accessible
      //.anonymous(AbstractHttpConfigurer::disable)
      .authorizeHttpRequests(auth -> auth
        // Public endpoints
        .requestMatchers(HttpMethod.POST, "/api/users/register").permitAll()
        .requestMatchers(HttpMethod.POST, "/api/users/login").permitAll()
        .requestMatchers(HttpMethod.GET, "/login", "/register").permitAll()
        .requestMatchers(HttpMethod.GET, "/catalog").permitAll()
        .requestMatchers(HttpMethod.GET, "/profile").permitAll()
        .requestMatchers("/payment", "/payment/**").permitAll()
        .requestMatchers(HttpMethod.HEAD, "/payment").permitAll()

        // Static resources
        .requestMatchers("/", "/css/**", "/js/**", "/images/**", "/favicon.ico",
          "/login.html", "/register.html", "/book.html", "/catalog.html",
          "/pages/**", "/sitemap/sitemap.html").permitAll()

        // Admin endpoints - использовать hasRole вместо hasAuthority
        .requestMatchers("/api/users/admin/**").hasRole("admin")
        .requestMatchers("/api/orders/admin/**").hasRole("admin")
        .requestMatchers("/api/admin/**").hasRole("admin")
        // Admin page is served to everyone; client enforces access via token
        .requestMatchers(HttpMethod.GET, "/admin").permitAll()

        // Books and media - public read access
        .requestMatchers(HttpMethod.GET, "/api/books/**").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/media/**").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()

        // Book management (admin only)
        .requestMatchers(HttpMethod.POST, "/api/books/**").hasRole("admin")
        .requestMatchers(HttpMethod.PUT, "/api/books/**").hasRole("admin")
        .requestMatchers(HttpMethod.DELETE, "/api/books/**").hasRole("admin")

        // Media management (admin only)
        .requestMatchers(HttpMethod.POST, "/api/media/**").hasRole("admin")
        .requestMatchers(HttpMethod.DELETE, "/api/media/**").hasRole("admin")

        // Reviews management
        .requestMatchers(HttpMethod.POST, "/api/reviews/**").authenticated()
        .requestMatchers(HttpMethod.PUT, "/api/reviews/**").authenticated()
        .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").authenticated()
        .requestMatchers("/api/reviews/my").authenticated()

        // User avatars
        .requestMatchers(HttpMethod.GET, "/api/users/me/avatar").authenticated()
        .requestMatchers(HttpMethod.PUT, "/api/users/me/avatar").authenticated()
        .requestMatchers(HttpMethod.DELETE, "/api/users/me/avatar").authenticated()
        .requestMatchers(HttpMethod.GET, "/api/users/{userId}/avatar").permitAll()

        // User profile
        .requestMatchers("/api/users/me").authenticated()
        .requestMatchers("/api/users/me/**").authenticated()

        // Orders
        .requestMatchers("/api/orders/**").authenticated()
        .requestMatchers(HttpMethod.GET, "/orders").permitAll()

        // Cart and wishlist
        .requestMatchers("/api/cart/**").authenticated()
        .requestMatchers("/api/wishlist/**").authenticated()
        .requestMatchers(HttpMethod.GET, "/cart").permitAll()
        .requestMatchers(HttpMethod.GET, "/wishlist").permitAll()

        // Any other request
        .anyRequest().authenticated())
      .authenticationProvider(authenticationProvider())
      .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
    return authConfig.getAuthenticationManager();
  }

  @Bean
  public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userService);
    authProvider.setPasswordEncoder(passwordEncoder);
    return authProvider;
  }
}
