/**
 * Descripción: test unitario del controlador de la entidad Tipo.
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

import com.theca.backend.entity.Tipo;
import com.theca.backend.enums.EstadoSincronizacion;
import com.theca.backend.repository.TipoRepository;

@ExtendWith(MockitoExtension.class)
public class TipoControllerTest {

    @Mock
    private TipoRepository tipoRepository;

    @InjectMocks
    private TipoController tipoController;

    private Tipo tipo1;
    private Tipo tipo2;

    @BeforeEach
    void setUp() {
        tipo1 = new Tipo();
        tipo1.setId("1");
        tipo1.setNombre("Tipo 1");
        tipo1.setFechaModificacion(LocalDateTime.now());
        tipo1.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);

        tipo2 = new Tipo();
        tipo2.setId("2");
        tipo2.setNombre("Tipo 2");
        tipo2.setFechaModificacion(LocalDateTime.now());
        tipo2.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);
    }

    @Test
    void getAll_ShouldReturnList() {
        when(tipoRepository.findAll()).thenReturn(Arrays.asList(tipo1, tipo2));
        List<Tipo> result = tipoController.getAll();
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(tipoRepository, times(1)).findAll();
    }

    @Test
    void getById_ShouldReturnTipo() {
        when(tipoRepository.findById("1")).thenReturn(Optional.of(tipo1));
        ResponseEntity<Tipo> resp = tipoController.getById("1");
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("Tipo 1", resp.getBody().getNombre());
    }

    @Test
    void create_ShouldSaveTipo() {
        when(tipoRepository.save(any(Tipo.class))).thenAnswer(i -> i.getArgument(0));
        Tipo t = new Tipo();
        t.setNombre("Nuevo");
        Tipo saved = tipoController.create(t);
        assertNotNull(saved.getFechaModificacion());
        assertEquals(EstadoSincronizacion.PENDIENTE, saved.getEstadoSincronizacion());
        verify(tipoRepository, times(1)).save(any(Tipo.class));
    }
}
