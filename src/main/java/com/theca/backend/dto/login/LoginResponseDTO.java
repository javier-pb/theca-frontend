/**
 * Descripción: DTO para respuesta del login.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 * 
 */

package com.theca.backend.dto.login;

import java.util.List;

// DTO para la respuesta del login:
public class LoginResponseDTO {
    
	private String token;
    private String type = "Bearer";
    private String id;
    private String username;
    private String email;
    private List<String> roles;

    public LoginResponseDTO(String token, String id, String username, String email, List<String> roles) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }

    public String getToken() {
    	return token;
    }
    
    public String getType() {
    	return type;
    }
    
    public String getId() {
    	return id;
    }
    
    public String getUsername() {
    	return username;
    }
    
    public String getEmail() {
    	return email;
    }
    
    public List<String> getRoles() {
    	return roles;
    }

}