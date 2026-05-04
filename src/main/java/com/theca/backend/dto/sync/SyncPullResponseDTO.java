/**
 * Descripción: DTO para respuesta de sincronización pull (servidor - cliente).
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 1 may 2026
 */

package com.theca.backend.dto.sync;

import java.util.List;

public class SyncPullResponseDTO {
    
    private List<CambioDTO> cambios;
    private String ultimaSincronizacion;
    
    public SyncPullResponseDTO() {}
    
    public SyncPullResponseDTO(List<CambioDTO> cambios, String ultimaSincronizacion) {
        this.cambios = cambios;
        this.ultimaSincronizacion = ultimaSincronizacion;
    }
    
    public List<CambioDTO> getCambios() {
    	return cambios;
    }

    public void setCambios(List<CambioDTO> cambios) {
    	this.cambios = cambios;
    }
    
    public String getUltimaSincronizacion() {
    	return ultimaSincronizacion;
    }
    
    public void setUltimaSincronizacion(String ultimaSincronizacion) {
    	this.ultimaSincronizacion = ultimaSincronizacion;
    }

}