/**
 * Descripción: repositorio de la entidad Usuario.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 18 abr 2026
 * 
 */

package com.theca.backend.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.theca.backend.entity.Usuario;

@Repository
public interface UsuarioRepository extends MongoRepository<Usuario, String> {
	
	// Buscar usuario por nombre:
	Optional<Usuario> findByNombre(String nombre);
	// Comprobar si existe un usuario por nombre o correo:
	boolean existsByNombre(String nombre);
	boolean existsByCorreo(String correo);
	
}
