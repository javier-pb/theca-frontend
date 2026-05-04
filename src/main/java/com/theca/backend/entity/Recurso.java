/**
 * Descripción: entidad Recurso.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 18 abr 2026
 * 
 */

package com.theca.backend.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.theca.backend.enums.EstadoSincronizacion;

import jakarta.validation.constraints.NotBlank;

@Document(collection = "recursos")
public class Recurso {

	// Propiedades de la entidad:
	@Id
	private String id;
	@NotBlank(message = "El titulo del recurso es obligatorio")
	private String titulo;
	private String descripcion;
	private String enlace;
	private byte[] portada;
	private LocalDateTime fechaCreacion;
	private LocalDateTime fechaModificacion;
	private EstadoSincronizacion estadoSincronizacion;
	private Double version;
	private Usuario usuario;
	private List<Tipo> tipos;
	private List<Etiqueta> etiquetas;
	private List<Categoria> categorias;
	private List<Autor> autores;
		    
	// Constructores de la entidad:
	public Recurso() {}
		    
	public Recurso(String id, String titulo, String descripcion, String enlace, byte[] portada, LocalDateTime fechaCreacion,
				   LocalDateTime fechaModificacion, EstadoSincronizacion estadoSincronizacion, Double version, Usuario usuario, List<Tipo> tipos,
				   List<Etiqueta> etiquetas, List<Categoria> categorias, List<Autor> autores) {
		super();
		this.id = id;
		this.titulo = titulo;
		this.descripcion = descripcion;
		this.enlace = enlace;
		this.portada = portada;
		this.fechaCreacion = fechaCreacion;
		this.fechaModificacion = fechaModificacion;
		this.estadoSincronizacion = estadoSincronizacion;
		this.version = version;
		this.usuario = usuario;
		this.tipos = tipos;
		this.etiquetas = etiquetas;
		this.categorias = categorias;
		this.autores = autores;
	}
	
	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}
	
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
	
	public EstadoSincronizacion getEstadoSincronizacion() {
		return estadoSincronizacion;
	}
	
	public void setEstadoSincronizacion(EstadoSincronizacion estadoSincronizacion) {
		this.estadoSincronizacion = estadoSincronizacion;
	}
	
	public Double getVersion() {
		return version;
	}
	
	public void setVersion(Double version) {
		this.version = version;
	}
	
	public Usuario getUsuario() {
		return usuario;
	}
	
	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}
	
	public List<Tipo> getTipos() {
		return tipos;
	}
	
	public void setTipos(List<Tipo> tipos) {
		this.tipos = tipos;
	}

	public List<Etiqueta> getEtiquetas() {
		return etiquetas;
	}
	
	public void setEtiquetas(List<Etiqueta> etiquetas) {
		this.etiquetas = etiquetas;
	}

	public List<Categoria> getCategorias() {
		return categorias;
	}
	
	public void setCategorias(List<Categoria> categorias) {
		this.categorias = categorias;
	}

	public List<Autor> getAutores() {
		return autores;
	}
	
	public void setAutores(List<Autor> autores) {
		this.autores = autores;
	}
	
}
