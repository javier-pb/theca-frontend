/**
 * Descripción: test unitario para la clase JwtUtils.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 20 abr 2026
 * 
 */

package com.theca.backend.security.jwt;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    // Se inyectan los valores manualmente (simulando los de application.properties):
    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "d2FwSnR5R2hhbUZ0eUdoYW1GdHlHaGFtRnR5R2hhbUZ0eUdoYW1GdHlHaGFtRnR5R2hhbUZ0eUdoYW1GdHlHaGFt");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 86400000);
    }

    // Test para verificar que el token generado no es nulo y tiene el formato correcto:
    @Test
    void generateToken_ShouldReturnValidToken() {
        String mockUsername = "Javier";
        String token = jwtUtils.generateJwtToken(mockUsername);
        
        assertNotNull(token);
        assertTrue(token.split("\\.").length == 3);
    }

    // Tests para validar un token correcto y otro incorrecto:
    @Test
    void validateJwtToken_ShouldReturnTrue_ForValidToken() {
        String token = jwtUtils.generateJwtToken("Javier");
        assertTrue(jwtUtils.validateJwtToken(token));
    }

    @Test
    void validateJwtToken_ShouldReturnFalse_ForInvalidToken() {
        String invalidToken = "Token inválido";
        assertFalse(jwtUtils.validateJwtToken(invalidToken));
    }

    // Test para verificar que se puede extraer el nombre de usuario del token JWT:
    @Test
    void getUserNameFromJwtToken_ShouldReturnUsername() {
        String username = "javier";
        String token = jwtUtils.generateJwtToken(username);
        String extractedUsername = jwtUtils.getUserNameFromJwtToken(token);
        assertEquals(username, extractedUsername);
    }
    
}
