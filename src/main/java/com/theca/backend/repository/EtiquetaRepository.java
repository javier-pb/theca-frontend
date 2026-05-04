/**
 * Descripción: repositorio de la entidad Etiqueta.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 * 
 */

package com.theca.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.theca.backend.entity.Etiqueta;

@Repository
public interface EtiquetaRepository extends MongoRepository<Etiqueta, String> {}
