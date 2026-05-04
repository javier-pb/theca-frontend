/**
 * Descripción: repositorio de la entidad Categoria.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 * 
 */

package com.theca.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.theca.backend.entity.Categoria;

@Repository
public interface CategoriaRepository extends MongoRepository<Categoria, String> {}
