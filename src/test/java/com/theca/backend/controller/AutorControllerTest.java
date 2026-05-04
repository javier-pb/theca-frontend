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

import com.theca.backend.entity.Autor;
import com.theca.backend.enums.EstadoSincronizacion;
import com.theca.backend.repository.AutorRepository;

@ExtendWith(MockitoExtension.class)
public class AutorControllerTest {

    @Mock
    private AutorRepository autorRepository;

    @InjectMocks
    private AutorController autorController;

    private Autor autor1;
    private Autor autor2;

    @BeforeEach
    void setUp() {
        autor1 = new Autor();
        autor1.setId("1");
        autor1.setNombre("Autor 1");
        autor1.setFechaModificacion(LocalDateTime.now());
        autor1.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);

        autor2 = new Autor();
        autor2.setId("2");
        autor2.setNombre("Autor 2");
        autor2.setFechaModificacion(LocalDateTime.now());
        autor2.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);
    }

    @Test
    void getAll_ShouldReturnList() {
        when(autorRepository.findAll()).thenReturn(Arrays.asList(autor1, autor2));
        List<Autor> result = autorController.getAll();
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(autorRepository, times(1)).findAll();
    }

    @Test
    void getById_ShouldReturnAutor() {
        when(autorRepository.findById("1")).thenReturn(Optional.of(autor1));
        ResponseEntity<Autor> resp = autorController.getById("1");
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("Autor 1", resp.getBody().getNombre());
    }

    @Test
    void create_ShouldSaveAutor() {
        when(autorRepository.save(any(Autor.class))).thenAnswer(i -> i.getArgument(0));
        Autor a = new Autor();
        a.setNombre("Nuevo");
        Autor saved = autorController.create(a);
        assertNotNull(saved.getFechaModificacion());
        assertEquals(EstadoSincronizacion.PENDIENTE, saved.getEstadoSincronizacion());
        verify(autorRepository, times(1)).save(any(Autor.class));
    }
}
