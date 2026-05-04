/**
 * Descripción: Manejador global de excepciones para la API.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 23 abr 2026
 */

package com.theca.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Manejador para excepciones genéricas (Error 500):
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleAllExceptions(Exception ex, WebRequest request) {
        ErrorResponseDTO error = new ErrorResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error interno del servidor", ex.getMessage(),
											          request.getDescription(false));
        
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    // Manejador para usuario no encontrado
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleUsernameNotFoundException(UsernameNotFoundException ex, WebRequest request) {
        ErrorResponseDTO error = new ErrorResponseDTO(HttpStatus.NOT_FOUND.value(), "Usuario no encontrado", ex.getMessage(),
        											  request.getDescription(false));
        
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
    
    // Manejador para recursos no encontrados:
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponseDTO> handleRuntimeException(RuntimeException ex, WebRequest request) {
        HttpStatus status = ex.getMessage().contains("no encontrado") ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
        ErrorResponseDTO error = new ErrorResponseDTO(status.value(), status.getReasonPhrase(), ex.getMessage(), request.getDescription(false));
        
        return new ResponseEntity<>(error, status);
    }
    
    // Manejador para errores de validación (Error 400):
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {
        // Se recogen todos los errores de validación en un solo mensaje:
        String mensajeError = ex.getBindingResult().getFieldErrors().stream()
        										   .map(error -> error.getField() + ": " + error.getDefaultMessage())
        										   .reduce((msg1, msg2) -> msg1 + "; " + msg2)
        						 .orElse("Error de validación");
        
        ErrorResponseDTO error = new ErrorResponseDTO(HttpStatus.BAD_REQUEST.value(), "Error de validación", mensajeError,
        											  request.getDescription(false));
        
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
    
}