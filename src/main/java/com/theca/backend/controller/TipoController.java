/**
 * Descripción: controlador de la entidad Tipo.
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

import com.theca.backend.dto.tipo.UpdateTipoDTO;
import com.theca.backend.entity.Tipo;
import com.theca.backend.enums.EstadoSincronizacion;
import com.theca.backend.repository.TipoRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Tipos", description = "Endpoints para gestionar tipos de recursos")
@RequestMapping("/api/tipos")
public class TipoController {

    private final TipoRepository tipoRepository;

    public TipoController(TipoRepository tipoRepository) {
        this.tipoRepository = tipoRepository;
    }

    @GetMapping
    @Operation(summary = "Obtener todos los tipos", description = "Devuelve una lista de todos los tipos de recursos")
    @ApiResponses({
		@ApiResponse(responseCode = "200", description = "Lista de tipos obtenida exitosamente"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public List<Tipo> getAll() {
        return tipoRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener tipo por ID", description = "Devuelve un tipo de recurso específico según su ID")
    @ApiResponses({
    	@ApiResponse(responseCode = "200", description = "Tipo obtenido exitosamente"),
    	@ApiResponse(responseCode = "404", description = "Tipo no encontrado"),
    	@ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Tipo> getById(@PathVariable String id) {
        return tipoRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear un nuevo tipo", description = "Crea un nuevo tipo de recurso")
    @ApiResponses({
		@ApiResponse(responseCode = "201", description = "Tipo creado exitosamente"),
		@ApiResponse(responseCode = "400", description = "Solicitud inválida"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public Tipo create(@RequestBody Tipo tipo) {
        tipo.setFechaModificacion(LocalDateTime.now());
        tipo.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);
        return tipoRepository.save(tipo);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un tipo existente", description = "Actualiza un tipo de recurso existente con los datos proporcionados")
    @ApiResponses({
		@ApiResponse(responseCode = "200", description = "Tipo actualizado exitosamente"),
		@ApiResponse(responseCode = "400", description = "Solicitud inválida"),
		@ApiResponse(responseCode = "404", description = "Tipo no encontrado"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public ResponseEntity<Tipo> update(@PathVariable String id,
    								   @Valid @RequestBody UpdateTipoDTO tipoActualizado) {
        return tipoRepository.findById(id).map(tipoExistente -> {
            if (tipoActualizado.getNombre() != null) {
                tipoExistente.setNombre(tipoActualizado.getNombre());
            }
            if (tipoActualizado.getEstadoSincronizacion() != null) {
                tipoExistente.setEstadoSincronizacion(tipoActualizado.getEstadoSincronizacion());
            }
            tipoExistente.setFechaModificacion(LocalDateTime.now());
            return ResponseEntity.ok(tipoRepository.save(tipoExistente));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un tipo", description = "Elimina un tipo de recurso existente según su ID")
    @ApiResponses({
		@ApiResponse(responseCode = "204", description = "Tipo eliminado exitosamente"),
		@ApiResponse(responseCode = "404", description = "Tipo no encontrado"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (tipoRepository.existsById(id)) {
            tipoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
