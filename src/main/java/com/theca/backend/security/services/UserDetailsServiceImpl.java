/**
 * Descripción: Servicio para cargar usuario por nombre.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 */

package com.theca.backend.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.theca.backend.entity.Usuario;
import com.theca.backend.repository.UsuarioRepository;

// Servicio para cargar usuario por nombre:
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    // Se inyecta el repositorio de usuarios:
	@Autowired
    UsuarioRepository usuarioRepository;

	// Se implementa el método para cargar usuario por nombre:
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByNombre(username).orElseThrow(() ->
        	new UsernameNotFoundException("No se encontró el usuario con nombre de usuario: " + username));
        return UserDetailsImpl.build(usuario);
    }
    
}