package back.mappers;


import back.dto.BookDTO;
import back.models.Book;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookMapper {
  BookDTO toDTO(Book book);
  Book toEntity(BookDTO dto);
}

