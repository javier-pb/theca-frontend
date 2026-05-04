/**
 * Descripción: DTO para petición de login.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 * 
 */

package com.theca.backend.dto.login;

import jakarta.validation.constraints.NotBlank;

// DTO para la petición de login:
public class LoginRequestDTO {
	
	@NotBlank(message = "El usuario es obligatorio")
    private String username;
	@NotBlank(message = "La contraseña es obligatoria")
    private String password;

    public String getUsername() {
    	return username;
    }
    
    public void setUsername(String username) {
    	this.username = username;
    }
    
    public String getPassword() {
    	return password;
    }
    
    public void setPassword(String password) {
    	this.password = password;
    }
    
}
