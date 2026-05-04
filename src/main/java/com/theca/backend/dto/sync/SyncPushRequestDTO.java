/**
 * Descripción: DTO para solicitud de sincronización push (cliente - servidor).
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 1 may 2026
 */

package com.theca.backend.dto.sync;

import java.util.List;

public class SyncPushRequestDTO {
    
    private List<CambioDTO> cambios;
    private String dispositivoId;
    
    public List<CambioDTO> getCambios() {
    	return cambios;
    }
    
    public void setCambios(List<CambioDTO> cambios) {
    	this.cambios = cambios;
    }
    
    public String getDispositivoId() {
    	return dispositivoId;
    }
    
    public void setDispositivoId(String dispositivoId) {
    	this.dispositivoId = dispositivoId;
    }

}