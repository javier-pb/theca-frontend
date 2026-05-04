/**
 * Descripción: DTO para actualizar una Etiqueta.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 */

package com.theca.backend.dto.etiqueta;

import com.theca.backend.enums.EstadoSincronizacion;

import jakarta.validation.constraints.NotBlank;

public class UpdateEtiquetaDTO {

	@NotBlank(message = "El nombre de la etiqueta es obligatorio")
    private String nombre;
    private EstadoSincronizacion estadoSincronizacion;

    public UpdateEtiquetaDTO() {}

    public String getNombre() {
    	return nombre;
    }
    
    public void setNombre(String nombre) {
    	this.nombre = nombre;
    }

    public EstadoSincronizacion getEstadoSincronizacion() {
    	return estadoSincronizacion;
    }
    
    public void setEstadoSincronizacion(EstadoSincronizacion estadoSincronizacion) {
    	this.estadoSincronizacion = estadoSincronizacion;
    }

}
