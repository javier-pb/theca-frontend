/**
 * Descripción: DTO para crear un nuevo Recurso.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 */

package com.theca.backend.dto.recurso;

import java.util.List;

import jakarta.validation.constraints.NotBlank;

public class CreateRecursoDTO {
    
    // Campos que el usuario puede enviar al crear:
	@NotBlank(message = "El titulo del recurso es obligatorio")
    private String titulo;
    private String descripcion;
    private String enlace;
    private byte[] portada;
    private String usuarioId;
    private List<String> tiposIds;
    private List<String> etiquetasIds;
    private List<String> categoriasIds;
    private List<String> autoresIds;
    
    public String getTitulo() {
    	return titulo;
    }
    
    public void setTitulo(String titulo) {
    	this.titulo = titulo;
    }
    
    public String getDescripcion() {
    	return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
    	this.descripcion = descripcion;
    }
    
    public String getEnlace() {
    	return enlace;
    }
    
    public void setEnlace(String enlace) {
    	this.enlace = enlace;
    }
    
    public byte[] getPortada() {
    	return portada;
    }
    public void setPortada(byte[] portada) {
    	this.portada = portada;
    }
    
    public String getUsuarioId() {
    	return usuarioId;
    }
    
    public void setUsuarioId(String usuarioId) {
    	this.usuarioId = usuarioId;
    }
    
    public List<String> getTiposIds() {
    	return tiposIds;
    }
    
    public void setTiposIds(List<String> tiposIds) {
    	this.tiposIds = tiposIds;
    }
    
    public List<String> getEtiquetasIds() {
    	return etiquetasIds;
    }
    
    public void setEtiquetasIds(List<String> etiquetasIds) {
    	this.etiquetasIds = etiquetasIds;
    }
    
    public List<String> getCategoriasIds() {
    	return categoriasIds;
    }
    
    public void setCategoriasIds(List<String> categoriasIds) {
    	this.categoriasIds = categoriasIds;
    }
    
    public List<String> getAutoresIds() {
    	return autoresIds;
    }
    
    public void setAutoresIds(List<String> autoresIds) {
    	this.autoresIds = autoresIds;
    }

}