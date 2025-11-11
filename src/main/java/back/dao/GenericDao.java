package back.dao;

import org.hibernate.Session;
import org.hibernate.Transaction;
import back.utils.HibernateUtil;
import java.util.List;

public class GenericDao<T> {

  private final Class<T> clazz;

  public GenericDao(Class<T> clazz) {
    this.clazz = clazz;
  }

  public void save(T entity) {
    try (Session session = HibernateUtil.getSessionFactory().openSession()) {
      Transaction tx = session.beginTransaction();
      session.persist(entity);
      tx.commit();
    }
  }

  public void update(T entity) {
    try (Session session = HibernateUtil.getSessionFactory().openSession()) {
      Transaction tx = session.beginTransaction();
      session.merge(entity);
      tx.commit();
    }
  }

  public void delete(T entity) {
    try (Session session = HibernateUtil.getSessionFactory().openSession()) {
      Transaction tx = session.beginTransaction();
      session.remove(entity);
      tx.commit();
    }
  }

  public T findById(Integer id) {
    try (Session session = HibernateUtil.getSessionFactory().openSession()) {
      return session.find(clazz, id);
    }
  }

  public List<T> findAll() {
    try (Session session = HibernateUtil.getSessionFactory().openSession()) {
      return session.createQuery("from " + clazz.getName(), clazz).list();
    }
  }
}

