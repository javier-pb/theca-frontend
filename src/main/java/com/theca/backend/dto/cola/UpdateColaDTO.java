/**
 * Descripción: DTO para actualizar la Cola.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 */

package com.theca.backend.dto.cola;

public class UpdateColaDTO {

    private Boolean sincronizado;
    private String jsonDatosCambiados;

    public UpdateColaDTO() {}

    public Boolean getSincronizado() {
    	return sincronizado;
    }
    
    public void setSincronizado(Boolean sincronizado) {
    	this.sincronizado = sincronizado;
    }

    public String getJsonDatosCambiados() {
    	return jsonDatosCambiados;
    }
    
    public void setJsonDatosCambiados(String jsonDatosCambiados) {
    	this.jsonDatosCambiados = jsonDatosCambiados;
    }

}
