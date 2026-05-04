/**
 * Descripción: controlador de la entidad Recurso.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 18 abr 2026 12:33:39
 * 
 */

package com.theca.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.theca.backend.dto.recurso.CreateRecursoDTO;
import com.theca.backend.dto.recurso.RecursoSearchDTO;
import com.theca.backend.dto.recurso.UpdateRecursoDTO;
import com.theca.backend.entity.Autor;
import com.theca.backend.entity.Categoria;
import com.theca.backend.entity.Etiqueta;
import com.theca.backend.entity.Recurso;
import com.theca.backend.entity.Tipo;
import com.theca.backend.entity.Usuario;
import com.theca.backend.enums.EstadoSincronizacion;
import com.theca.backend.repository.RecursoRepository;
import com.theca.backend.service.RecursoSearchService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Recursos", description = "Endpoints para gestionar recursos")
@RequestMapping("/api/recursos")
public class RecursoController {

	private final RecursoRepository recursoRepository;
	
	@Autowired
	private RecursoSearchService recursoSearchService;
	    
	// Constructor (inyección de dependencias):
	public RecursoController(RecursoRepository recursoRepository) {
		this.recursoRepository = recursoRepository;
	}
	    
	// Endopoint GET /api/recursos (obtener todos los recursos):
	@GetMapping
	@Operation(summary = "Obtener todos los recursos",
			   description = "Devuelve una lista de todos los recursos."
			   			   + " Se puede filtrar por usuarioId usando el parámetro de consulta 'usuarioId'")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Lista de recursos obtenida exitosamente"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
	public List<Recurso> getAll(@RequestParam(required = false) String usuarioId) {
	    if (usuarioId != null && !usuarioId.isEmpty()) {
	        return recursoRepository.findByUsuarioId(usuarioId);
	    }
	    return recursoRepository.findAll();
	}
	
	// Endopoint GET /usuario/{usuarioId} (obtener todos los recursos por usuarioId):
	@GetMapping("/usuario/{usuarioId}")
	@Operation(summary = "Obtener recursos por usuarioId", description = "Devuelve una lista de recursos asociados a un usuario específico")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Lista de recursos obtenida exitosamente"),
		@ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
	public List<Recurso> getByUsuario(@PathVariable String usuarioId) {
	    return recursoRepository.findByUsuarioId(usuarioId);
	}
	    
	// Endpoint GET /api/recursos/{id} (obtener un recurso por su ID):
	@GetMapping("/{id}")
	@Operation(summary = "Obtener recurso por ID", description = "Devuelve un recurso específico según su ID")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Recurso obtenido exitosamente"),
		@ApiResponse(responseCode = "404", description = "Recurso no encontrado"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
	public ResponseEntity<Recurso> getById(@PathVariable String id) {
		return recursoRepository.findById(id).map(ResponseEntity::ok)
								.orElse(ResponseEntity.notFound()
								.build());
	}
	    
	// Endpooint POST /api/recursos (crear un nuevo recurso):
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@Operation(summary = "Crear nuevo recurso", description = "Crea un nuevo recurso con los datos proporcionados")
	@ApiResponses({
		@ApiResponse(responseCode = "201", description = "Recurso creado exitosamente"),
		@ApiResponse(responseCode = "400", description = "Solicitud inválida"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
	public Recurso create(@Valid @RequestBody CreateRecursoDTO dto) {
		Recurso recurso = new Recurso();
		recurso.setTitulo(dto.getTitulo());
		recurso.setDescripcion(dto.getDescripcion());
		recurso.setEnlace(dto.getEnlace());
		recurso.setPortada(dto.getPortada());
		if (dto.getUsuarioId() != null) {
			Usuario usuario = new Usuario();
			usuario.setId(dto.getUsuarioId());
			recurso.setUsuario(usuario);
		}
		if (dto.getTiposIds() != null) {
			List<Tipo> tipos = dto.getTiposIds().stream().map(id -> {
				Tipo t = new Tipo(); t.setId(id); return t;
			}).toList();
			recurso.setTipos(tipos);
		}
		if (dto.getEtiquetasIds() != null) {
			List<Etiqueta> etiquetas = dto.getEtiquetasIds().stream().map(id -> {
				Etiqueta e = new Etiqueta(); e.setId(id); return e;
			}).toList();
			recurso.setEtiquetas(etiquetas);
		}
		if (dto.getCategoriasIds() != null) {
			List<Categoria> categorias = dto.getCategoriasIds().stream().map(id -> {
				Categoria c = new Categoria(); c.setId(id); return c;
			}).toList();
			recurso.setCategorias(categorias);
		}
		if (dto.getAutoresIds() != null) {
			List<Autor> autores = dto.getAutoresIds().stream().map(id -> {
				Autor a = new Autor(); a.setId(id); return a;
			}).toList();
			recurso.setAutores(autores);
		}

		recurso.setFechaCreacion(LocalDateTime.now());
		recurso.setFechaModificacion(LocalDateTime.now());
		recurso.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);
		return recursoRepository.save(recurso);
	}
	
	// Endpooint POST /usuario/{usuarioId} (crear un nuevo recurso con usuarioId):
	@PostMapping("/usuario/{usuarioId}")
	@ResponseStatus(HttpStatus.CREATED)
	@Operation(summary = "Crear nuevo recurso con usuarioId", description = "Crea un nuevo recurso asociado a un usuario específico")
	@ApiResponses({
		@ApiResponse(responseCode = "201", description = "Recurso creado exitosamente"),
		@ApiResponse(responseCode = "400", description = "Solicitud inválida"),
		@ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
	public Recurso createWithUser(@PathVariable String usuarioId, @RequestBody CreateRecursoDTO dto) {
		dto.setUsuarioId(usuarioId);
		return create(dto);
	}
	
	// Endpoint PUT /api/recursos/{id} (actualizar un recurso existente):
	@PutMapping("/{id}")
	@Operation(summary = "Actualizar recurso existente", description = "Actualiza un recurso existente con los datos proporcionados")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Recurso actualizado exitosamente"),
		@ApiResponse(responseCode = "400", description = "Solicitud inválida"),
		@ApiResponse(responseCode = "404", description = "Recurso no encontrado"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
	public ResponseEntity<Recurso> update(@PathVariable String id,
										  @Valid @RequestBody UpdateRecursoDTO recursoActualizado) {
		return recursoRepository.findById(id).map(recursoExistente -> {
			// Sólo se actualizan los campos que vienen en la petición:
			if (recursoActualizado.getTitulo() != null) {
				recursoExistente.setTitulo(recursoActualizado.getTitulo());
			}
			if (recursoActualizado.getDescripcion() != null) {
				recursoExistente.setDescripcion(recursoActualizado.getDescripcion());
			}
			if (recursoActualizado.getEnlace() != null) {
				recursoExistente.setEnlace(recursoActualizado.getEnlace());
			}
			if (recursoActualizado.getPortada() != null) {
				recursoExistente.setPortada(recursoActualizado.getPortada());
			}
			if (recursoActualizado.getEstadoSincronizacion() != null) {
				recursoExistente.setEstadoSincronizacion(recursoActualizado.getEstadoSincronizacion());
			}
			if (recursoActualizado.getVersion() != null) {
				recursoExistente.setVersion(recursoActualizado.getVersion());
			}

			recursoExistente.setFechaModificacion(LocalDateTime.now());
			return ResponseEntity.ok(recursoRepository.save(recursoExistente));
		}).orElse(ResponseEntity.notFound().build());
	}
	    
	// Endpoint DELETE /api/recursos/{id} (eliminar un recurso):
	@DeleteMapping("/{id}")
	@Operation(summary = "Eliminar recurso", description = "Elimina un recurso específico según su ID")
	@ApiResponses({
		@ApiResponse(responseCode = "204", description = "Recurso eliminado exitosamente"),
		@ApiResponse(responseCode = "404", description = "Recurso no encontrado"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
	public ResponseEntity<Void> delete(@PathVariable String id) {
		if (recursoRepository.existsById(id)) {
			recursoRepository.deleteById(id);
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.notFound().build();
	}
	
	// Endpoint POST /buscar (búsqueda avanzada de recursos):
	@PostMapping("/buscar")
	@Operation(summary = "Búsqueda avanzada de recursos", description = "Realiza una búsqueda avanzada de recursos según los criterios proporcionados")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Búsqueda realizada exitosamente"),
		@ApiResponse(responseCode = "400", description = "Solicitud inválida"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
	public List<Recurso> search(@RequestBody RecursoSearchDTO searchDTO) {
	    return recursoSearchService.search(searchDTO);
	}
	
}
