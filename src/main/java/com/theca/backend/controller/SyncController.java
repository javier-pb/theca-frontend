/**
 * Descripción: Controlador para endpoints de sincronización offline/online.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 1 may 2026
 */

package com.theca.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.theca.backend.dto.sync.SyncPullResponseDTO;
import com.theca.backend.dto.sync.SyncPushRequestDTO;
import com.theca.backend.service.SyncService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Sincronización", description = "Endpoints para sincronización offline/online de datos")
@RequestMapping("/api/sync")
public class SyncController {

    @Autowired
    private SyncService syncService;

    @PostMapping("/push")
    @Operation(summary = "Enviar cambios al servidor", description = "El cliente envía los cambios realizados mientras estaba offline")
    @ApiResponses({
		@ApiResponse(responseCode = "200", description = "Cambios recibidos y procesados exitosamente"),
		@ApiResponse(responseCode = "400", description = "Solicitud inválida"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public ResponseEntity<Void> pushChanges(@RequestBody SyncPushRequestDTO request) {
        syncService.pushChanges(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/pull")
    @Operation(summary = "Obtener cambios pendientes del servidor", description = "El cliente solicita los cambios que el servidor tiene pendientes para sincronizar")
    @ApiResponses({
    	@ApiResponse(responseCode = "200", description = "Cambios obtenidos exitosamente"),
    	@ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<SyncPullResponseDTO> pullChanges() {
        SyncPullResponseDTO response = syncService.pullChanges();
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/confirm")
    @Operation(summary = "Confirmar sincronización exitosa", description = "El cliente confirma que ha recibido y aplicado los cambios pendientes del servidor")
    @ApiResponses({
		@ApiResponse(responseCode = "200", description = "Sincronización confirmada exitosamente"),
		@ApiResponse(responseCode = "400", description = "Solicitud inválida"),
		@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
    public ResponseEntity<Void> confirmSync(@RequestBody List<String> ids) {
        syncService.markAsSynced(ids);
        return ResponseEntity.ok().build();
    }
    
}