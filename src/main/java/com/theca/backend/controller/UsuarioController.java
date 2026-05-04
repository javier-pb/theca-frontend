/**
 * Descripción: controlador de la entidad Usuario.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 18 abr 2026
 * 
 */

package com.theca.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.theca.backend.dto.usuario.CreateUsuarioDTO;
import com.theca.backend.dto.usuario.UpdateUsuarioDTO;
import com.theca.backend.entity.Usuario;
import com.theca.backend.repository.UsuarioRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Usuarios", description = "Endpoints para gestionar usuarios")
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    
    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    
    @GetMapping
    @Operation(summary = "Obtener todos los usuarios", description = "Devuelve una lista de todos los usuarios")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Lista de usuarios obtenida exitosamente"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public List<Usuario> getAll() {
        return usuarioRepository.findAll();
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID", description = "Devuelve un usuario específico según su ID")
    @ApiResponses({
		@ApiResponse(responseCode = "200", description = "Usuario obtenido exitosamente"),
		@ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public ResponseEntity<Usuario> getById(@PathVariable String id) {
        return usuarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear un nuevo usuario", description = "Crea un nuevo usuario")
    @ApiResponses({
    	@ApiResponse(responseCode = "201", description = "Usuario creado exitosamente"),
    	@ApiResponse(responseCode = "400", description = "Solicitud inválida"),
    	@ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public Usuario create(@Valid @RequestBody CreateUsuarioDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setNombre(dto.getNombre());
        usuario.setCorreo(dto.getCorreo());
        usuario.setContrasena(dto.getContrasena());
        usuario.setFechaCreacion(LocalDateTime.now());
        return usuarioRepository.save(usuario);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un usuario existente", description = "Actualiza un usuario existente con los datos proporcionados")
    @ApiResponses({
		@ApiResponse(responseCode = "200", description = "Usuario actualizado exitosamente"),
		@ApiResponse(responseCode = "400", description = "Solicitud inválida"),
		@ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public ResponseEntity<Usuario> update(@PathVariable String id,
    									  @Valid @RequestBody UpdateUsuarioDTO usuarioActualizado) {
        return usuarioRepository.findById(id)
                .map(usuarioExistente -> {
                    if (usuarioActualizado.getNombre() != null) {
                        usuarioExistente.setNombre(usuarioActualizado.getNombre());
                    }
                    if (usuarioActualizado.getCorreo() != null) {
                        usuarioExistente.setCorreo(usuarioActualizado.getCorreo());
                    }
                    if (usuarioActualizado.getContrasena() != null) {
                        usuarioExistente.setContrasena(usuarioActualizado.getContrasena());
                    }
                    return ResponseEntity.ok(usuarioRepository.save(usuarioExistente));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un usuario", description = "Elimina un usuario específico según su ID")
    @ApiResponses({
    	@ApiResponse(responseCode = "204", description = "Usuario eliminado exitosamente"),
    	@ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
    	@ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}