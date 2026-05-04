/**
 * Descripción: DTO para crear una nueva Categoria.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 * 
 */
package com.theca.backend.dto.categoria;

import jakarta.validation.constraints.NotBlank;

public class CreateCategoriaDTO {

	@NotBlank(message = "El nombre de la categoría es obligatorio")
    private String nombre;
    private String categoriaPadreId;

    public CreateCategoriaDTO() {}

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCategoriaPadreId() {
        return categoriaPadreId;
    }

    public void setCategoriaPadreId(String categoriaPadreId) {
        this.categoriaPadreId = categoriaPadreId;
    }
}
