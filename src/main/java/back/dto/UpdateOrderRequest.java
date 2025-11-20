package back.dto;

public class UpdateOrderRequest {
  private String status;
  private Double totalPrice;
  private String notes;

  public UpdateOrderRequest() {}

  public UpdateOrderRequest(String status, Double totalPrice, String notes) {
    this.status = status;
    this.totalPrice = totalPrice;
    this.notes = notes;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public Double getTotalPrice() {
    return totalPrice;
  }

  public void setTotalPrice(Double totalPrice) {
    this.totalPrice = totalPrice;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }
}
