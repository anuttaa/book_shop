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
      .anonymous(AbstractHttpConfigurer::disable)
      .authorizeHttpRequests(auth -> auth
        .requestMatchers(HttpMethod.POST, "/api/users/register").permitAll()
        .requestMatchers(HttpMethod.POST, "/api/users/login").permitAll()
        .requestMatchers("/api/users/admin/all").permitAll()

        .requestMatchers("/api/users/admin/**").hasAuthority("ROLE_admin")
        .requestMatchers("/api/orders/admin/**").hasAuthority("ROLE_admin")

        .requestMatchers("/api/books/**").permitAll()
        .requestMatchers("/api/media/**").permitAll()
        .requestMatchers("/api/reviews/**").permitAll()

        .requestMatchers("/api/reviews/my").authenticated()

        .requestMatchers(HttpMethod.GET, "/api/users/me/avatar").authenticated()
        .requestMatchers(HttpMethod.PUT, "/api/users/me/avatar").authenticated()
        .requestMatchers(HttpMethod.DELETE, "/api/users/me/avatar").authenticated()
        .requestMatchers(HttpMethod.GET, "/api/users/{userId}/avatar").permitAll()

        .requestMatchers("/api/users/me").authenticated()
        .requestMatchers("/api/users/me/**").authenticated()

        .requestMatchers("/api/orders/**").authenticated()

        .requestMatchers("/", "/pages/**", "/css/**", "/js/**", "/images/**", "/favicon.ico",
          "/login", "/register","/catalog", "/cart", "/wishlist", "/orders", "/admin",
          "/login.html", "/register.html", "/profile", "/sitemap/sitemap.html").permitAll()
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