/**
 * Descripción: entidad Cola (sincronización offline).
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

import com.theca.backend.enums.EntidadCola;
import com.theca.backend.enums.OperacionCola;

@Document(collection = "cola")
public class Cola {
    
    @Id
    private String id;
    private EntidadCola entidad;
    private String idEntidad;
    private OperacionCola operacion;
    private String jsonDatosCambiados;
    private LocalDateTime fechaModificacion;
    private Boolean sincronizado = false;
    
    public Cola() {}
    
    public Cola(String id, EntidadCola entidad, String idEntidad, OperacionCola operacion,  String jsonDatosCambiados, LocalDateTime fechaModificacion,
    			Boolean sincronizado) {
        this.id = id;
        this.entidad = entidad;
        this.idEntidad = idEntidad;
        this.operacion = operacion;
        this.jsonDatosCambiados = jsonDatosCambiados;
        this.fechaModificacion = fechaModificacion;
        this.sincronizado = sincronizado;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public EntidadCola getEntidad() {
        return entidad;
    }
    
    public void setEntidad(EntidadCola entidad) {
        this.entidad = entidad;
    }
    
    public String getIdEntidad() {
        return idEntidad;
    }
    
    public void setIdEntidad(String idEntidad) {
        this.idEntidad = idEntidad;
    }
    
    public OperacionCola getOperacion() {
        return operacion;
    }
    
    public void setOperacion(OperacionCola operacion) {
        this.operacion = operacion;
    }
    
    public String getJsonDatosCambiados() {
        return jsonDatosCambiados;
    }
    
    public void setJsonDatosCambiados(String jsonDatosCambiados) {
        this.jsonDatosCambiados = jsonDatosCambiados;
    }
    
    public LocalDateTime getFechaModificacion() {
        return fechaModificacion;
    }
    
    public void setFechaModificacion(LocalDateTime fechaModificacion) {
        this.fechaModificacion = fechaModificacion;
    }
    
    public Boolean isSincronizado() {
        return sincronizado;
    }
    
    public void setSincronizado(Boolean sincronizado) {
        this.sincronizado = sincronizado;
    }

}
