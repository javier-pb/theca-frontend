/**
 * Descripción: DTO para crear un nuevo Autor.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 * 
 */
package com.theca.backend.dto.autor;

public class CreateAutorDTO {

    private String nombre;

    public CreateAutorDTO() {}

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
