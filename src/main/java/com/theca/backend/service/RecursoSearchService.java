/**
 * Descripción: Servicio para la búsqueda avanzada (consulta dinámica) de recursos en la base de datos MongoDB.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 22 abr 2026
 * 
 */

package com.theca.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

// ...existing code...
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Collation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.theca.backend.dto.recurso.RecursoSearchDTO;
import com.theca.backend.entity.Recurso;

@Service
public class RecursoSearchService {

	// Inyección del MongoTemplate para realizar consultas dinámicas en MongoDB:
    @Autowired
    private MongoTemplate mongoTemplate;

    public List<Recurso> search(RecursoSearchDTO searchDTO) {
    	// Se crea una consulta vacía:
        Query query = new Query();
        // Lista para almacenar los criterios de búsqueda:
        List<Criteria> criteriaList = new ArrayList<>();

        // BÚSQUEDAS PARA LA BARRA DE BÚSQUEDA:
        // Búsqueda por título (parcial):
        if (searchDTO.getTitulo() != null && !searchDTO.getTitulo().isEmpty()) {
        	// Busca que el campo titulo contenga valor (parcial); "i" ignora mayúsculas; "$diacriticSensitive: false" ignora acentos:
            criteriaList.add(Criteria.where("titulo").regex(searchDTO.getTitulo(), "i"));
        }

        // Búsqueda por autor (parcial);
        if (searchDTO.getAutor() != null && !searchDTO.getAutor().isEmpty()) {
            criteriaList.add(Criteria.where("autores.nombre").regex(searchDTO.getAutor(), "i"));
        }
        
        // Búsqueda por categoria (parcial);
        if (searchDTO.getCategoria() != null && !searchDTO.getCategoria().isEmpty()) {
            criteriaList.add(Criteria.where("categorias.nombre").regex(searchDTO.getCategoria(), "i"));
        }
        
        // Búsqueda por etiqueta (parcial);
        if (searchDTO.getEtiqueta() != null && !searchDTO.getEtiqueta().isEmpty()) {
            criteriaList.add(Criteria.where("etiquetas.nombre").regex(searchDTO.getEtiqueta(), "i"));
        }
        
        // BÚSQUEDAS PARA LA BÚSQUEDA AVANZADA:
        // Búsqueda por autor/es (exacta, múltiple):
        if (searchDTO.getAutores() != null && !searchDTO.getAutores().isEmpty()) {
            for (String autor : searchDTO.getAutores()) {
                criteriaList.add(Criteria.where("autores.nombre").is(autor));
            }
        }

        // Búsqueda por tipo (exacta):
        if (searchDTO.getTipo() != null && !searchDTO.getTipo().isEmpty()) {
            criteriaList.add(Criteria.where("tipo").is(searchDTO.getTipo()));
        }

        // Búsqueda por versión (exacta):
        if (searchDTO.getVersion() != null) {
            criteriaList.add(Criteria.where("version").is(searchDTO.getVersion()));
        }

        // Búsqueda por descripción (parcial):
        if (searchDTO.getDescripcion() != null && !searchDTO.getDescripcion().isEmpty()) {
            criteriaList.add(Criteria.where("descripcion").regex(searchDTO.getDescripcion(), "i"));
        }
        
        // Búsqueda por estado de sincronización (exacta):
        if (searchDTO.getEstadoSincronizacion() != null) {
            criteriaList.add(Criteria.where("estadoSincronizacion").is(searchDTO.getEstadoSincronizacion()));
        }

        // Búsqueda por categoría/s (exacta, múltiple):
        if (searchDTO.getCategorias() != null && !searchDTO.getCategorias().isEmpty()) {
            for (String categoria : searchDTO.getCategorias()) {
                criteriaList.add(Criteria.where("categorias.nombre").is(categoria));
            }
        }

        // Búsqueda por etiqueta/s (exacta, múltiple):
        if (searchDTO.getEtiquetas() != null && !searchDTO.getEtiquetas().isEmpty()) {
            for (String etiqueta : searchDTO.getEtiquetas()) {
                criteriaList.add(Criteria.where("etiquetas.nombre").is(etiqueta));
            }
        }
        
        // Búsqueda por fecha de creación (exacta):
        if (searchDTO.getFechaCreacion() != null) {
            LocalDate fecha = searchDTO.getFechaCreacion().toLocalDate();
            LocalDateTime startOfDay = fecha.atStartOfDay();
            LocalDateTime endOfDay = fecha.atTime(LocalTime.MAX);
            criteriaList.add(Criteria.where("fechaCreacion").gte(startOfDay).lte(endOfDay));
        }
        
        // Búsqueda por fecha de modificación (exacta):
        if (searchDTO.getFechaModificacion() != null) {
            LocalDate fecha = searchDTO.getFechaModificacion().toLocalDate();
            LocalDateTime startOfDay = fecha.atStartOfDay();
            LocalDateTime endOfDay = fecha.atTime(LocalTime.MAX);
            criteriaList.add(Criteria.where("fechaModificacion").gte(startOfDay).lte(endOfDay));
        }

        // Combinar todos los criterios con AND:
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        // Se establece collation para ignorar acentos (localización española y nivel PRIMARY para que se ignoren diacríticos):
        query.collation(Collation.of("es").strength(1));

        return mongoTemplate.find(query, Recurso.class);
    }
}