/**
 * Descripción: repositorio de la entidad Autor.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 * 
 */

package com.theca.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.theca.backend.entity.Autor;

@Repository
public interface AutorRepository extends MongoRepository<Autor, String> {}
