/**
 * Descripción: Implementación de UserDetails para Spring Security.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 */

package com.theca.backend.security.services;

import java.util.Collection;
import java.util.Collections;
import java.util.Objects;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.theca.backend.entity.Usuario;
import com.fasterxml.jackson.annotation.JsonIgnore;

/*
Implementa la interfaz UserDetails de Spring Security,
que define los métodos que necesita para manejar usuarios autenticados:
*/
public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    // Atributos del usuario:
    private String id;
    private String username;
    private String email;
    @JsonIgnore
    private String password;

    // Constructor:
    public UserDetailsImpl(String id, String username, String email, String password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // Método estático para construir un UserDetailsImpl a partir de un usuario:
    public static UserDetailsImpl build(Usuario usuario) {
        return new UserDetailsImpl(usuario.getId(),
        						   usuario.getNombre(),
        						   usuario.getCorreo(),
        						   usuario.getContrasena());
    }

    // Getters:
    public String getId() {
        return id;
    }

    @Override
    public String getUsername() {
        return username;
    }
    
    public String getEmail() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    // Si se implementan roles o permisos, se pueden agregar aquí:
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    // Métodos para indicar si la cuenta está activa, no bloqueada, etc.:
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // Sobrescribe el método equals para comparar usuarios por ID:
    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
		}
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
    
}