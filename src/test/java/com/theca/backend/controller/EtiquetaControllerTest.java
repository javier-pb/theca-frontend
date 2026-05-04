/**
 * Descripción: test unitario del controlador de la entidad Autor.
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

import com.theca.backend.entity.Etiqueta;
import com.theca.backend.enums.EstadoSincronizacion;
import com.theca.backend.repository.EtiquetaRepository;

@ExtendWith(MockitoExtension.class)
public class EtiquetaControllerTest {

    @Mock
    private EtiquetaRepository etiquetaRepository;

    @InjectMocks
    private EtiquetaController etiquetaController;

    private Etiqueta e1;
    private Etiqueta e2;

    @BeforeEach
    void setUp() {
        e1 = new Etiqueta();
        e1.setId("1");
        e1.setNombre("E1");
        e1.setFechaModificacion(LocalDateTime.now());
        e1.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);

        e2 = new Etiqueta();
        e2.setId("2");
        e2.setNombre("E2");
        e2.setFechaModificacion(LocalDateTime.now());
        e2.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);
    }

    @Test
    void getAll_ShouldReturnList() {
        when(etiquetaRepository.findAll()).thenReturn(Arrays.asList(e1, e2));
        List<Etiqueta> result = etiquetaController.getAll();
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(etiquetaRepository, times(1)).findAll();
    }

    @Test
    void getById_ShouldReturnEtiqueta() {
        when(etiquetaRepository.findById("1")).thenReturn(Optional.of(e1));
        ResponseEntity<Etiqueta> resp = etiquetaController.getById("1");
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("E1", resp.getBody().getNombre());
    }

    @Test
    void create_ShouldSaveEtiqueta() {
        when(etiquetaRepository.save(any(Etiqueta.class))).thenAnswer(i -> i.getArgument(0));
        Etiqueta t = new Etiqueta();
        t.setNombre("Nueva");
        Etiqueta saved = etiquetaController.create(t);
        assertNotNull(saved.getFechaModificacion());
        assertEquals(EstadoSincronizacion.PENDIENTE, saved.getEstadoSincronizacion());
        verify(etiquetaRepository, times(1)).save(any(Etiqueta.class));
    }
}
