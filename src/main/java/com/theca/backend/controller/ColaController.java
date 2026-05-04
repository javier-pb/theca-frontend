/**
 * Descripción: controlador de la entidad Cola (sincronización offline).
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 * 
 */

package com.theca.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.theca.backend.entity.Cola;
import com.theca.backend.repository.ColaRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Cola de sincronización", description = "Endpoints para gestionar la sincronización offline")
@RequestMapping("/api/cola")
public class ColaController {

    private final ColaRepository colaRepository;

    public ColaController(ColaRepository colaRepository) {
        this.colaRepository = colaRepository;
    }

    @GetMapping
    @Operation(summary = "Obtener todas las entradas de la cola", description = "Devuelve una lista de todas las entradas en la cola de sincronización")
    @ApiResponses({
		@ApiResponse(responseCode = "200", description = "Lista de entradas obtenida exitosamente"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public List<Cola> getAll() {
        return colaRepository.findAll();
    }

    @GetMapping("/pendientes")
    @Operation(summary = "Obtener entradas pendientes de sincronización", description = "Devuelve una lista de las entradas en la cola que aún no han sido sincronizadas")
    @ApiResponses({
    	@ApiResponse(responseCode = "200", description = "Lista de entradas pendientes obtenida exitosamente"),
    	@ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public List<Cola> getPendientes() {
        return colaRepository.findBySincronizadoFalse();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener entrada por ID", description = "Devuelve una entrada específica en la cola según su ID")
    @ApiResponses({
    	@ApiResponse(responseCode = "200", description = "Entrada obtenida exitosamente"),
		@ApiResponse(responseCode = "404", description = "Entrada no encontrada"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Cola> getById(@PathVariable String id) {
        return colaRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Agregar entrada a la cola", description = "Agrega una nueva entrada a la cola de sincronización")
    @ApiResponses({
		@ApiResponse(responseCode = "201", description = "Entrada creada exitosamente"),
		@ApiResponse(responseCode = "400", description = "Solicitud inválida"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public Cola create(@RequestBody Cola cola) {
        cola.setFechaModificacion(LocalDateTime.now());
        cola.setSincronizado(false);
        return colaRepository.save(cola);
    }

    @PutMapping("/sincronizar/{id}")
    @Operation(summary = "Marcar entrada como sincronizada", description = "Marca una entrada en la cola como sincronizada después de que se haya procesado correctamente")
    @ApiResponses({
		@ApiResponse(responseCode = "200", description = "Entrada marcada como sincronizada exitosamente"),
		@ApiResponse(responseCode = "404", description = "Entrada no encontrada"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public ResponseEntity<Cola> marcarSincronizado(@PathVariable String id) {
        return colaRepository.findById(id).map(c -> {
            c.setSincronizado(true);
            c.setFechaModificacion(LocalDateTime.now());
            return ResponseEntity.ok(colaRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }
}
