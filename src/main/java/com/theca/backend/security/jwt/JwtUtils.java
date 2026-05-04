/**
 * Descripción: Utilidades para generación y validación de JWT.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 * 
 */

package com.theca.backend.security.jwt;

import java.security.Key;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.theca.backend.security.services.UserDetailsImpl;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

// Clase gestionada por Spring para poder inyectarla en otras clases:
@Component
public class JwtUtils {
    // Objeto para escribir mensaje de log (ej.: errores) relacionados con JWT:
	private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

	// Se leen los valores desde el application.properties:
    @Value("${theca.app.jwtSecret}")
    private String jwtSecret;

    @Value("${theca.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    // Se convierte jwtSecret en una clave criptográfica que JWT puede usar para firmar y verificar tokens:
    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    // Método para generar un token JWT a partir de la autenticación del usuario:
    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        
        return Jwts.builder().setSubject((userPrincipal.getUsername())).setIssuedAt(new Date())
                	.setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                	.signWith(key(), SignatureAlgorithm.HS512).compact();
    }

    // Método para extraer el nombre de usuario del token JWT:
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token).getBody().getSubject();
    }

    // Método para validar un token JWT, verificando su firma y su fecha de expiración:
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Token JWT inválido: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("Token JWT expirado: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Token JWT no soportado: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JLa cadena del token JWT está vacía: {}", e.getMessage());
        }
        return false;
    }
    
    // Método auxiliar para generar un token JWT a partir de un nombre de usuario:
    public String generateJwtToken(String username) {
        return Jwts.builder().setSubject(username).setIssuedAt(new Date())
        		.setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS512).compact();
    }
    
}