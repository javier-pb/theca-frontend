/**
 * Descripción: DTO para crear un nuevo Tipo.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 * 
 */
package com.theca.backend.dto.tipo;

import jakarta.validation.constraints.NotBlank;

public class CreateTipoDTO {

	@NotBlank(message = "El nombre del tipo de recurso es obligatorio")
    private String nombre;

    public CreateTipoDTO() {}

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
