/**
 * Descripción: controlador de la entidad Categoria.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
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

import com.theca.backend.dto.categoria.UpdateCategoriaDTO;
import com.theca.backend.entity.Categoria;
import com.theca.backend.enums.EstadoSincronizacion;
import com.theca.backend.repository.CategoriaRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Categorías", description = "Endpoints para gestionar categorías")
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    public CategoriaController(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    @Operation(summary = "Obtener todas las categorías", description = "Devuelve una lista de todas las categorías")
    @ApiResponses({
    	@ApiResponse(responseCode = "200", description = "Lista de categorías obtenida exitosamente"),
    	@ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public List<Categoria> getAll() {
        return categoriaRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener categoría por ID", description = "Devuelve una categoría específica según su ID")
    @ApiResponses({
		@ApiResponse(responseCode = "200", description = "Categoría obtenida exitosamente"),
		@ApiResponse(responseCode = "404", description = "Categoría no encontrada"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public ResponseEntity<Categoria> getById(@PathVariable String id) {
        return categoriaRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear nueva categoría", description = "Crea una nueva categoría con los datos proporcionados")
    @ApiResponses({
		@ApiResponse(responseCode = "201", description = "Categoría creada exitosamente"),
		@ApiResponse(responseCode = "400", description = "Solicitud inválida"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public Categoria create(@RequestBody Categoria categoria) {
        categoria.setFechaModificacion(LocalDateTime.now());
        categoria.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);
        return categoriaRepository.save(categoria);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar categoría existente", description = "Actualiza una categoría existente con los datos proporcionados")
    @ApiResponses({
    	@ApiResponse(responseCode = "200", description = "Categoría actualizada exitosamente"),
    	@ApiResponse(responseCode = "400", description = "Solicitud inválida"),
    	@ApiResponse(responseCode = "404", description = "Categoría no encontrada"),
    })
    public ResponseEntity<Categoria> update(@PathVariable String id,
    										@Valid @RequestBody UpdateCategoriaDTO categoriaActualizada) {
        return categoriaRepository.findById(id).map(categoriaExistente -> {
            if (categoriaActualizada.getNombre() != null) {
                categoriaExistente.setNombre(categoriaActualizada.getNombre());
            }
            if (categoriaActualizada.getCategoriaPadreId() != null) {
                categoriaExistente.setCategoriaPadreId(categoriaActualizada.getCategoriaPadreId());
            }
            if (categoriaActualizada.getEstadoSincronizacion() != null) {
                categoriaExistente.setEstadoSincronizacion(categoriaActualizada.getEstadoSincronizacion());
            }
            categoriaExistente.setFechaModificacion(LocalDateTime.now());
            return ResponseEntity.ok(categoriaRepository.save(categoriaExistente));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar categoría", description = "Elimina una categoría específica según su ID")
    @ApiResponses({
		@ApiResponse(responseCode = "204", description = "Categoría eliminada exitosamente"),
		@ApiResponse(responseCode = "404", description = "Categoría no encontrada"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (categoriaRepository.existsById(id)) {
            categoriaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
