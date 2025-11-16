package back.mappers;


import back.dto.BookDTO;
import back.models.Book;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BookMapper {

  @Mapping(target = "type", source = "type")
  @Mapping(target = "cover", expression = "java(getCoverUrl(book))")
  BookDTO toDTO(Book book);

  @Mapping(target = "type", source = "type")
  Book toEntity(BookDTO dto);

  default String getCoverUrl(Book book) {
    if (book.getMedia() != null && !book.getMedia().isEmpty()) {
      return book.getMedia().get(0).getFileUrl();
    }
    return "/images/default-book.jpg";
  }
}


