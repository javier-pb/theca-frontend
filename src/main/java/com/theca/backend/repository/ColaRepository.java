/**
 * Descripción: repositorio de la entidad Cola.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 * 
 */

package com.theca.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.theca.backend.entity.Cola;

@Repository
public interface ColaRepository extends MongoRepository<Cola, String> {

    // Buscar elementos no sincronizados:
    List<Cola> findBySincronizadoFalse();
}
