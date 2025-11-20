package back.enums;

public enum OrderStatus {
  created,
  paid,
  shipped,
  completed,
  cancelled;

  public static boolean isValid(String status) {
    if (status == null) return false;
    try {
      OrderStatus.valueOf(status.toLowerCase());
      return true;
    } catch (IllegalArgumentException e) {
      return false;
    }
  }

  public static OrderStatus fromString(String status) {
    if (status == null) {
      throw new IllegalArgumentException("Status cannot be null");
    }
    try {
      return OrderStatus.valueOf(status.toLowerCase());
    } catch (IllegalArgumentException e) {
      throw new IllegalArgumentException("Invalid order status: " + status);
    }
  }
}
