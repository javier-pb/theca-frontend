/**
 * Descripción: DTO para crear un nuevo elemento en la Cola (sincronización).
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 * 
 */
package com.theca.backend.dto.cola;

import com.theca.backend.enums.EntidadCola;
import com.theca.backend.enums.OperacionCola;

public class CreateColaDTO {

    private EntidadCola entidad;
    private String idEntidad;
    private OperacionCola operacion;
    private String jsonDatosCambiados;
    private Boolean sincronizado;

    public CreateColaDTO() {}

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

    public Boolean getSincronizado() {
        return sincronizado;
    }

    public void setSincronizado(Boolean sincronizado) {
        this.sincronizado = sincronizado;
    }
}
