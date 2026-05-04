/**
 * Descripción: entidad Categoría.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 18 abr 2026
 * 
 */

package com.theca.backend.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.theca.backend.enums.EstadoSincronizacion;

import jakarta.validation.constraints.NotBlank;

@Document(collection = "categorias")
public class Categoria {
    
    @Id
    private String id;
    @NotBlank(message = "El nombre de la categoría es obligatorio")
    private String nombre;
    private LocalDateTime fechaModificacion;
    private EstadoSincronizacion estadoSincronizacion;
    private String categoriaPadreId;
    
    public Categoria() {}
    
    public Categoria(String id, String nombre, LocalDateTime fechaModificacion, EstadoSincronizacion estadoSincronizacion, String categoriaPadreId) {
        this.id = id;
        this.nombre = nombre;
        this.fechaModificacion = fechaModificacion;
        this.estadoSincronizacion = estadoSincronizacion;
        this.categoriaPadreId = categoriaPadreId;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public LocalDateTime getFechaModificacion() {
        return fechaModificacion;
    }
    
    public void setFechaModificacion(LocalDateTime fechaModificacion) {
        this.fechaModificacion = fechaModificacion;
    }
    
    public EstadoSincronizacion getEstadoSincronizacion() {
        return estadoSincronizacion;
    }
    
    public void setEstadoSincronizacion(EstadoSincronizacion estadoSincronizacion) {
        this.estadoSincronizacion = estadoSincronizacion;
    }
    
    public String getCategoriaPadreId() {
        return categoriaPadreId;
    }
    
    public void setCategoriaPadreId(String categoriaPadreId) {
        this.categoriaPadreId = categoriaPadreId;
    }

}
