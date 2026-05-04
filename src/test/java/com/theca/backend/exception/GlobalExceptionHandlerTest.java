/**
 * Descripción: Test para el GlobalExceptionHandler.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 23 abr 2026
 */

package com.theca.backend.exception;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleAllExceptions_ShouldReturn500() {
        RuntimeException ex = new RuntimeException("Error de prueba");
        MockHttpServletRequest request = new MockHttpServletRequest();
        WebRequest webRequest = new ServletWebRequest(request);
        
        ResponseEntity<ErrorResponseDTO> response = handler.handleAllExceptions(ex, webRequest);
        
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().getStatus());
        assertEquals("Error interno del servidor", response.getBody().getError());
    }
    
}