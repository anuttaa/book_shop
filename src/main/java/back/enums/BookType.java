package back.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum BookType {
  electronic,
  physical;

  @JsonCreator
  public static BookType fromValue(String value) {
    if (value == null) {
      return physical;
    }
    String v = value.trim().toLowerCase();
    return BookType.valueOf(v);
  }
}
