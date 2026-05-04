/**
 * Descripción: test unitario del controlador de la entidad Cola.
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

import com.theca.backend.entity.Cola;
import com.theca.backend.enums.EntidadCola;
import com.theca.backend.enums.OperacionCola;
import com.theca.backend.repository.ColaRepository;

@ExtendWith(MockitoExtension.class)
public class ColaControllerTest {

    @Mock
    private ColaRepository colaRepository;

    @InjectMocks
    private ColaController colaController;

    private Cola c1;
    private Cola c2;

    @BeforeEach
    void setUp() {
        c1 = new Cola();
        c1.setId("1");
        c1.setEntidad(EntidadCola.RECURSO);
        c1.setIdEntidad("r1");
        c1.setOperacion(OperacionCola.CREATE);
        c1.setFechaModificacion(LocalDateTime.now());
        c1.setSincronizado(false);

        c2 = new Cola();
        c2.setId("2");
        c2.setEntidad(EntidadCola.RECURSO);
        c2.setIdEntidad("r2");
        c2.setOperacion(OperacionCola.UPDATE);
        c2.setFechaModificacion(LocalDateTime.now());
        c2.setSincronizado(false);
    }

    @Test
    void getAll_ShouldReturnList() {
        when(colaRepository.findAll()).thenReturn(Arrays.asList(c1, c2));
        List<Cola> result = colaController.getAll();
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(colaRepository, times(1)).findAll();
    }

    @Test
    void getPendientes_ShouldReturnNonSynced() {
        when(colaRepository.findBySincronizadoFalse()).thenReturn(Arrays.asList(c1));
        List<Cola> result = colaController.getPendientes();
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(colaRepository, times(1)).findBySincronizadoFalse();
    }

    @Test
    void getById_ShouldReturnCola() {
        when(colaRepository.findById("1")).thenReturn(Optional.of(c1));
        ResponseEntity<Cola> resp = colaController.getById("1");
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("r1", resp.getBody().getIdEntidad());
    }

    @Test
    void create_ShouldSaveCola() {
        when(colaRepository.save(any(Cola.class))).thenAnswer(i -> i.getArgument(0));
        Cola newC = new Cola();
        newC.setEntidad(EntidadCola.RECURSO);
        newC.setOperacion(OperacionCola.CREATE);
        Cola saved = colaController.create(newC);
        assertNotNull(saved.getFechaModificacion());
        assertEquals(false, saved.isSincronizado());
        verify(colaRepository, times(1)).save(any(Cola.class));
    }

    @Test
    void marcarSincronizado_ShouldSetTrue() {
        when(colaRepository.findById("1")).thenReturn(Optional.of(c1));
        when(colaRepository.save(any(Cola.class))).thenAnswer(i -> i.getArgument(0));
        ResponseEntity<Cola> resp = colaController.marcarSincronizado("1");
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals(true, resp.getBody().isSincronizado());
    }
}
