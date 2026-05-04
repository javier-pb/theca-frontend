/**
 * Descripción: DTO para la búsqueda avanzada de recursos.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 22 abr 2026
 */

package com.theca.backend.dto.recurso;

import java.time.LocalDateTime;
import java.util.List;

import com.theca.backend.enums.EstadoSincronizacion;

public class RecursoSearchDTO {
    
    // BARRA DE BÚSQUEDA:
    private String titulo;
    private String autor;
    private String categoria;
    private String etiqueta;
    // BÚSQUEDA AVANZADA:
    private List<String> autores;
    private String tipo;
    private Double version;
    private String descripcion;
    private EstadoSincronizacion estadoSincronizacion;
    private List<String> categorias;
    private List<String> etiquetas;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
    
    public String getTitulo() {
    	return titulo;
    }
    
    public void setTitulo(String titulo) {
    	this.titulo = titulo;
    }
    
    public String getAutor() {
    	return autor;
    }
    
    public void setAutor(String autor) {
    	this.autor = autor;
    }
    
    public String getCategoria() {
    	return categoria;
    }
    
    public void setCategoria(String categoria) {
    	this.categoria = categoria;
    }
    
    public String getEtiqueta() {
    	return etiqueta;
    }
    
    public void setEtiqueta(String etiqueta) {
    	this.etiqueta = etiqueta;
    }
    
    public List<String> getAutores() {
    	return autores;
    }
    
    public void setAutores(List<String> autores) {
    	this.autores = autores;
    }
    
    public String getTipo() {
    	return tipo;
    }
    
    public void setTipo(String tipo) {
    	this.tipo = tipo;
    }
    
    public Double getVersion() {
    	return version;
    }
    
    public void setVersion(Double version) {
    	this.version = version;
    }
    
    public String getDescripcion() {
    	return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
    	this.descripcion = descripcion;
    }
    
    public EstadoSincronizacion getEstadoSincronizacion() {
    	return estadoSincronizacion;
    }
    
    public void setEstadoSincronizacion(EstadoSincronizacion estadoSincronizacion) {
    	this.estadoSincronizacion = estadoSincronizacion;
    }
    
    
    public List<String> getCategorias() {
    	return categorias;
    }
    
    public void setCategorias(List<String> categorias) {
    	this.categorias = categorias;
    }
    
    public List<String> getEtiquetas() {
    	return etiquetas;
    }
    public void setEtiquetas(List<String> etiquetas) {
    	this.etiquetas = etiquetas;
    }
    
    public LocalDateTime getFechaCreacion() {
    	return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
    	this.fechaCreacion = fechaCreacion;
    }
    
    public LocalDateTime getFechaModificacion() {
    	return fechaModificacion;
    }
    
    public void setFechaModificacion(LocalDateTime fechaModificacion) {
    	this.fechaModificacion = fechaModificacion;
    }

}