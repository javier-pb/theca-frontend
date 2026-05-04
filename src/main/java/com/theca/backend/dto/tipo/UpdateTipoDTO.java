/**
 * Descripción: DTO para actualizar un Tipo.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 */

package com.theca.backend.dto.tipo;

import com.theca.backend.enums.EstadoSincronizacion;

import jakarta.validation.constraints.NotBlank;

public class UpdateTipoDTO {

	@NotBlank(message = "El nombre del tipo de recurso es obligatorio")
    private String nombre;
    private EstadoSincronizacion estadoSincronizacion;

    public UpdateTipoDTO() {}

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