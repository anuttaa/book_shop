package back.utils;

import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import back.models.*;

public class HibernateUtil {

  private static final SessionFactory sessionFactory = buildSessionFactory();

  private static SessionFactory buildSessionFactory() {
    try {
      Configuration configuration = new Configuration();
      configuration.configure("hibernate.cfg.xml");

      configuration.addAnnotatedClass(User.class);
      configuration.addAnnotatedClass(Book.class);
      configuration.addAnnotatedClass(Media.class);
      configuration.addAnnotatedClass(CartItem.class);
      configuration.addAnnotatedClass(Order.class);
      configuration.addAnnotatedClass(OrderItem.class);
      configuration.addAnnotatedClass(Review.class);
      configuration.addAnnotatedClass(Wishlist.class);

      return configuration.buildSessionFactory();
    } catch (Throwable ex) {
      System.err.println("Initial SessionFactory creation failed: " + ex);
      throw new ExceptionInInitializerError(ex);
    }
  }

  public static SessionFactory getSessionFactory() {
    return sessionFactory;
  }

  public static void shutdown() {
    getSessionFactory().close();
  }
}
