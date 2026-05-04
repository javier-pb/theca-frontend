/**
 * Descripción: DTO para representar un cambio pendiente de sincronizar.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 1 may 2026
 */

package com.theca.backend.dto.sync;

public class CambioDTO {
    
    private String entidad;
    private String idEntidad;
    private String operacion;
    private String datosJson;
    
    public String getEntidad() {
    	return entidad;
    }
    
    public void setEntidad(String entidad) {
    	this.entidad = entidad;
    }
    
    public String getIdEntidad() {
    	return idEntidad;
    }
   
    public void setIdEntidad(String idEntidad) {
    	this.idEntidad = idEntidad;
    }
    
    public String getOperacion() {
    	return operacion;
    }
    
    public void setOperacion(String operacion) {
    	this.operacion = operacion;
    }
    
    public String getDatosJson() {
    	return datosJson;
    }
    
    public void setDatosJson(String datosJson) {
    	this.datosJson = datosJson;
    }

}
