package back.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.access.prepost.PreAuthorize;

@Controller
public class PageController {
  @GetMapping("/")
  public String mainPage() {
    return "forward:/pages/mainPage.html";
  }

  @GetMapping("/login")
  public String loginPage() {
    return "forward:/pages/login.html";
  }

  @GetMapping("/register")
  public String registerPage() {
    return "forward:/pages/register.html";
  }

  @GetMapping("/catalog")
  public String catalogPage() {
    return "forward:/pages/catalog.html";
  }

  @GetMapping("/cart")
  public String cartPage() {
    return "forward:/pages/cart.html";
  }

  @GetMapping("/wishlist")
  public String wishlistPage() {
    return "forward:/pages/wishlist.html";
  }

  @GetMapping("/orders")
  public String ordersPage() {
    return "forward:/pages/orders.html";
  }

  @GetMapping("/payment")
  public String paymentPage() {
    return "forward:/pages/payment.html";
  }

  @GetMapping("/profile")
  public String profilePage() {
    return "forward:/pages/profile.html";
  }

  @GetMapping("/admin")
  public String adminPage() {
    return "forward:/pages/admin.html";
  }
}
