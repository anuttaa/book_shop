package back.dao;

import back.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserDao extends JpaRepository<User, Long> {
  Optional<User> findByUsername(String username);

  Optional<User> findByEmail(String email);

  java.util.List<User> findBySubscribedTrue();

  @Query(value = "SELECT avatar_media_id FROM users WHERE id = :userId", nativeQuery = true)
  Long findAvatarMediaIdByUserId(@Param("userId") Long userId);

  @Modifying
  @Query(value = "UPDATE users SET avatar_media_id = :avatarMediaId WHERE id = :userId", nativeQuery = true)
  void updateUserAvatar(@Param("userId") Long userId, @Param("avatarMediaId") Long avatarMediaId);
}


