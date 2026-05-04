/**
 * Descripción: test unitario del controlador de la entidad Recurso.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 18 abr 2026
 * 
 */

package com.theca.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.theca.backend.dto.recurso.CreateRecursoDTO;
import com.theca.backend.dto.recurso.RecursoSearchDTO;
import com.theca.backend.dto.recurso.UpdateRecursoDTO;
import com.theca.backend.entity.Recurso;
import com.theca.backend.entity.Usuario;
import com.theca.backend.enums.EstadoSincronizacion;
import com.theca.backend.repository.RecursoRepository;
import com.theca.backend.service.RecursoSearchService;

@SpringBootTest
public class RecursoControllerTest {

	// Se inyectan el controlador, el repositorio, el servicio y dos recursos:
    @Autowired
    private RecursoController recursoController;

    @SuppressWarnings("removal")
	@MockBean
    private RecursoRepository recursoRepository;
    
    @SuppressWarnings("removal")
	@MockBean
    private RecursoSearchService recursoSearchService;
    
    private Recurso recurso1;
    private Recurso recurso2;
    
    // Antes de cada test, se inicializan los dos recursos inyectados:
    @BeforeEach
    void setUp() {
    	// Atributo portada mockeado:
        byte[] portadaPrueba = new byte[1024];
    	
    	// Atributo usuario mockeado:
        Usuario usuarioPrueba = new Usuario();
        usuarioPrueba.setId("user1");
        usuarioPrueba.setNombre("Usuario Prueba");
        usuarioPrueba.setCorreo("test@email.com");
    	
        recurso1 = new Recurso();
        recurso1.setId("1");
        recurso1.setTitulo("Título 1");
        recurso1.setDescripcion("Descripción 1");
        recurso1.setEnlace("Enlace 1");
        Arrays.fill(portadaPrueba, (byte) 0xFF);
        recurso1.setPortada(portadaPrueba);
        recurso1.setFechaCreacion(LocalDateTime.now());
        recurso1.setFechaModificacion(LocalDateTime.now());
        recurso1.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);
        recurso1.setVersion(1.0);
        recurso1.setUsuario(usuarioPrueba);

        recurso2 = new Recurso();
        recurso2.setId("2");
        recurso2.setTitulo("Título 2");
        recurso2.setDescripcion("Descripción 2");
        recurso2.setEnlace("Enlace 2");
        Arrays.fill(portadaPrueba, (byte) 0xFF);
        recurso2.setPortada(portadaPrueba);
        recurso2.setFechaCreacion(LocalDateTime.now());
        recurso2.setFechaModificacion(LocalDateTime.now());
        recurso2.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);
        recurso2.setVersion(1.0);
        recurso2.setUsuario(usuarioPrueba);
    }

    // Tests del endpoint GET /api/recursos (obtener todos los recursos):
    @Test
    void getAll_ShouldReturnListOfRecursos() {
        List<Recurso> expectedRecursos = Arrays.asList(recurso1, recurso2);
        when(recursoRepository.findAll()).thenReturn(expectedRecursos);

        List<Recurso> actualRecursos = recursoController.getAll(null);

        assertNotNull(actualRecursos);
        assertEquals(2, actualRecursos.size());
        assertEquals("Título 1", actualRecursos.get(0).getTitulo());
        assertEquals("Título 2", actualRecursos.get(1).getTitulo());
        verify(recursoRepository, times(1)).findAll();
    }

    @Test
    void getAll_ShouldReturnEmptyList_WhenNoRecursos() {
        when(recursoRepository.findAll()).thenReturn(Arrays.asList());

        List<Recurso> actualRecursos = recursoController.getAll(null);

        assertNotNull(actualRecursos);
        assertTrue(actualRecursos.isEmpty());
        verify(recursoRepository, times(1)).findAll();
    }

    // Tests del endpoint GET /api/recursos/{id} (obtener un recurso por su ID):
    @Test
    void getById_ShouldReturnRecurso_WhenIdExists() {
        when(recursoRepository.findById("1")).thenReturn(Optional.of(recurso1));

        ResponseEntity<Recurso> response = recursoController.getById("1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Título 1", response.getBody().getTitulo());
        verify(recursoRepository, times(1)).findById("1");
    }

    @Test
    void getById_ShouldReturnNotFound_WhenIdDoesNotExist() {
        when(recursoRepository.findById("999")).thenReturn(Optional.empty());

        ResponseEntity<Recurso> response = recursoController.getById("999");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
        verify(recursoRepository, times(1)).findById("999");
    }

    // Tests del endpoint POST /api/recursos (crear un nuevo recurso):
    @Test
    void create_ShouldSaveAndReturnRecurso() {
    	CreateRecursoDTO inputRecurso = new CreateRecursoDTO();
        inputRecurso.setTitulo("Nuevo libro");
        inputRecurso.setDescripcion("Nueva descripción");

        when(recursoRepository.save(any(Recurso.class))).thenAnswer(invocation -> {
            Recurso recursoGuardado = invocation.getArgument(0);
            recursoGuardado.setId("3");
            return recursoGuardado;
        });

        Recurso result = recursoController.create(inputRecurso);

        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals("Nuevo libro", result.getTitulo());
        assertEquals("Nueva descripción", result.getDescripcion());
        assertNotNull(result.getFechaCreacion());
        assertNotNull(result.getFechaModificacion());
        assertEquals(EstadoSincronizacion.PENDIENTE, result.getEstadoSincronizacion());
        verify(recursoRepository, times(1)).save(any(Recurso.class));
    }

    // Tests del endpoint PUT /api/recursos/{id} (actualizar un recurso existente):
    @Test
    void update_ShouldUpdateAndReturnRecurso_WhenIdExists() {
        UpdateRecursoDTO updateData = new UpdateRecursoDTO();
        updateData.setTitulo("Título actualizado");
        updateData.setDescripcion("Descripción actualizada");

        when(recursoRepository.findById("1")).thenReturn(Optional.of(recurso1));
        when(recursoRepository.save(any(Recurso.class))).thenReturn(recurso1);

        ResponseEntity<Recurso> response = recursoController.update("1", updateData);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Título actualizado", response.getBody().getTitulo());
        assertEquals("Descripción actualizada", response.getBody().getDescripcion());
        verify(recursoRepository, times(1)).findById("1");
        verify(recursoRepository, times(1)).save(any(Recurso.class));
    }

    @Test
    void update_ShouldReturnNotFound_WhenIdDoesNotExist() {
        UpdateRecursoDTO updateData = new UpdateRecursoDTO();
        updateData.setTitulo("Título actualizado");

        when(recursoRepository.findById("999")).thenReturn(Optional.empty());

        ResponseEntity<Recurso> response = recursoController.update("999", updateData);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(recursoRepository, times(1)).findById("999");
        verify(recursoRepository, never()).save(any(Recurso.class));
    }

    @Test
    void update_ShouldOnlyUpdateNonNullFields() {
        UpdateRecursoDTO updateData = new UpdateRecursoDTO();
        updateData.setTitulo("Solo título actualizado");

        when(recursoRepository.findById("1")).thenReturn(Optional.of(recurso1));
        when(recursoRepository.save(any(Recurso.class))).thenReturn(recurso1);

        ResponseEntity<Recurso> response = recursoController.update("1", updateData);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Solo título actualizado", response.getBody().getTitulo());
        assertEquals("Descripción 1", response.getBody().getDescripcion()); // No cambió
        verify(recursoRepository, times(1)).save(any(Recurso.class));
    }

    // Tests del endpoint DELETE /api/recursos/{id} (eliminar un recurso):
    @Test
    void delete_ShouldReturnNoContent_WhenIdExists() {
        when(recursoRepository.existsById("1")).thenReturn(true);
        doNothing().when(recursoRepository).deleteById("1");

        ResponseEntity<Void> response = recursoController.delete("1");

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(recursoRepository, times(1)).existsById("1");
        verify(recursoRepository, times(1)).deleteById("1");
    }

    @Test
    void delete_ShouldReturnNotFound_WhenIdDoesNotExist() {
        when(recursoRepository.existsById("999")).thenReturn(false);

        ResponseEntity<Void> response = recursoController.delete("999");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(recursoRepository, times(1)).existsById("999");
        verify(recursoRepository, never()).deleteById(anyString());
    }
	
	// Test del endpoint POST /buscar (búsqueda avanzada de recursos):
    @Test
    void search_ShouldReturnFilteredRecursos() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setTitulo("Título 1");
        
        List<Recurso> expectedRecursos = Arrays.asList(recurso1);
        
        when(recursoSearchService.search(any(RecursoSearchDTO.class))).thenReturn(expectedRecursos);
        
        List<Recurso> actualRecursos = recursoController.search(searchDTO);
        
        assertNotNull(actualRecursos);
        assertEquals(1, actualRecursos.size());
        assertEquals("Título 1", actualRecursos.get(0).getTitulo());
        verify(recursoSearchService, times(1)).search(any(RecursoSearchDTO.class));
    }
    
}
