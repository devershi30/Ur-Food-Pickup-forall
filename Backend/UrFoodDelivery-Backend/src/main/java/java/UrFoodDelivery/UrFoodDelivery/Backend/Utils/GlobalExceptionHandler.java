package com.UrFoodDelivery.UrFoodDelivery.Backend.Utils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.SneakyThrows;
import org.apache.coyote.BadRequestException;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @SneakyThrows
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception ex, HttpServletRequest request) {

        ex.printStackTrace();
        if(ex instanceof BadRequestException)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        else if (ex instanceof ChangeSetPersister.NotFoundException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } else if (ex instanceof BadCredentialsException) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        } else if(ex instanceof ConstraintViolationException) {
            String message = ex.getMessage();
            String fineMessage = "";

            String[] list = message.split(",");
            int count = 0;
            for(String i:list)
            {
                if(count>0)
                    fineMessage+=",\n";
                count++;
                String cs = i.trim();
                String[] spt = cs.split(":");
                if(spt.length>1)
                    fineMessage+=spt[spt.length-1];
                else
                    fineMessage+=cs;
            }

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(fineMessage);
        } else if (ex instanceof MethodArgumentNotValidException) {
            String errorMessage = ((MethodArgumentNotValidException)ex).getBindingResult().getFieldErrors().stream()
                    .map(error -> error.getField()+" "+error.getDefaultMessage())
                    .collect(Collectors.joining(", "));

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + ex.getMessage());
    }
}
