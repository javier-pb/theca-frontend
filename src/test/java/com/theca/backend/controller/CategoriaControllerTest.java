/**
 * Descripción: test unitario del controlador de la entidad Categoria.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 * 
 */

package com.theca.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.theca.backend.entity.Categoria;
import com.theca.backend.enums.EstadoSincronizacion;
import com.theca.backend.repository.CategoriaRepository;

@ExtendWith(MockitoExtension.class)
public class CategoriaControllerTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private CategoriaController categoriaController;

    private Categoria c1;
    private Categoria c2;

    @BeforeEach
    void setUp() {
        c1 = new Categoria();
        c1.setId("1");
        c1.setNombre("C1");
        c1.setFechaModificacion(LocalDateTime.now());
        c1.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);

        c2 = new Categoria();
        c2.setId("2");
        c2.setNombre("C2");
        c2.setFechaModificacion(LocalDateTime.now());
        c2.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);
    }

    @Test
    void getAll_ShouldReturnList() {
        when(categoriaRepository.findAll()).thenReturn(Arrays.asList(c1, c2));
        List<Categoria> result = categoriaController.getAll();
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(categoriaRepository, times(1)).findAll();
    }

    @Test
    void getById_ShouldReturnCategoria() {
        when(categoriaRepository.findById("1")).thenReturn(Optional.of(c1));
        ResponseEntity<Categoria> resp = categoriaController.getById("1");
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("C1", resp.getBody().getNombre());
    }

    @Test
    void create_ShouldSaveCategoria() {
        when(categoriaRepository.save(any(Categoria.class))).thenAnswer(i -> i.getArgument(0));
        Categoria t = new Categoria();
        t.setNombre("Nueva");
        Categoria saved = categoriaController.create(t);
        assertNotNull(saved.getFechaModificacion());
        assertEquals(EstadoSincronizacion.PENDIENTE, saved.getEstadoSincronizacion());
        verify(categoriaRepository, times(1)).save(any(Categoria.class));
    }
}
