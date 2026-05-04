/**
 * Descripción: DTO para actualizar un Usuario.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 */

package com.theca.backend.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UpdateUsuarioDTO {

	@Size(min = 3, max = 50, message = "El nombre debe tener entre 3 y 50 caracteres")
    private String nombre;
	@Email(message = "El email debe ser válido")
    private String correo;
	@Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String contrasena;

    public UpdateUsuarioDTO() {}

    public String getNombre() {
    	return nombre;
    }
    
    public void setNombre(String nombre) {
    	this.nombre = nombre;
    }

    public String getCorreo() {
    	return correo;
    }
    
    public void setCorreo(String correo) {
    	this.correo = correo;
    }

    public String getContrasena() {
    	return contrasena;
    }
    
    public void setContrasena(String contrasena) {
    	this.contrasena = contrasena;
    }
    
}
