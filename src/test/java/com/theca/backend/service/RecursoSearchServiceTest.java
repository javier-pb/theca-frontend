/**
 * Descripción: test unitario para RecursoSearchService.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 22 abr 2026
 */

package com.theca.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import com.theca.backend.dto.recurso.RecursoSearchDTO;
import com.theca.backend.entity.Recurso;
import com.theca.backend.entity.Usuario;
import com.theca.backend.enums.EstadoSincronizacion;

@ExtendWith(MockitoExtension.class)
class RecursoSearchServiceTest {

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private RecursoSearchService recursoSearchService;

    private Recurso recurso1;
    private Recurso recurso2;
    private List<Recurso> expectedRecursos;

    @BeforeEach
    void setUp() {
        Usuario usuarioPrueba = new Usuario();
        usuarioPrueba.setId("user1");

        recurso1 = new Recurso();
        recurso1.setId("1");
        recurso1.setTitulo("Cien años de soledad");
        recurso1.setDescripcion("Novela de García Márquez");
        recurso1.setVersion(1.0);
        recurso1.setUsuario(usuarioPrueba);
        recurso1.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);
        recurso1.setFechaCreacion(LocalDateTime.of(2024, 1, 15, 10, 30));

        recurso2 = new Recurso();
        recurso2.setId("2");
        recurso2.setTitulo("El Quijote");
        recurso2.setDescripcion("Novela de Cervantes");
        recurso2.setVersion(2.0);
        recurso2.setUsuario(usuarioPrueba);
        recurso2.setEstadoSincronizacion(EstadoSincronizacion.SINCRONIZADO);
        recurso2.setFechaCreacion(LocalDateTime.of(2024, 2, 20, 15, 45));

        expectedRecursos = Arrays.asList(recurso1, recurso2);
    }

    @Test
    void search_ShouldReturnAllRecursos_WhenNoFilters() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(expectedRecursos);
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }

    @Test
    void search_ShouldFilterByTitulo() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setTitulo("Cien");
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(Arrays.asList(recurso1));
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Cien años de soledad", result.get(0).getTitulo());
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }

    @Test
    void search_ShouldFilterByAutorParcial() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setAutor("García");
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(Arrays.asList(recurso1));
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }

    @Test
    void search_ShouldFilterByCategoriaParcial() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setCategoria("Literatura");
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(expectedRecursos);
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }

    @Test
    void search_ShouldFilterByEtiquetaParcial() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setEtiqueta("favorito");
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(expectedRecursos);
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }

    @Test
    void search_ShouldFilterByDescripcion() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setDescripcion("García Márquez");
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(Arrays.asList(recurso1));
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }

    @Test
    void search_ShouldFilterByTipo() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setTipo("libro");
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(expectedRecursos);
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }

    @Test
    void search_ShouldFilterByVersion() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setVersion(2.0);
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(Arrays.asList(recurso2));
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(2.0, result.get(0).getVersion());
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }

    @Test
    void search_ShouldFilterByEstadoSincronizacion() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setEstadoSincronizacion(EstadoSincronizacion.SINCRONIZADO);
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(Arrays.asList(recurso2));
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }

    @Test
    void search_ShouldFilterByMultipleAutores() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setAutores(Arrays.asList("García Márquez", "Cervantes"));
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(expectedRecursos);
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }

    @Test
    void search_ShouldFilterByMultipleCategorias() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setCategorias(Arrays.asList("Literatura", "Novela"));
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(expectedRecursos);
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }

    @Test
    void search_ShouldFilterByMultipleEtiquetas() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setEtiquetas(Arrays.asList("favorito", "pendiente"));
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(expectedRecursos);
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }

    @Test
    void search_ShouldFilterByFechaCreacion_EntireDay() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setFechaCreacion(LocalDateTime.of(2024, 1, 15, 0, 0));
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(Arrays.asList(recurso1));
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }

    @Test
    void search_ShouldFilterByFechaModificacion_EntireDay() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setFechaModificacion(LocalDateTime.of(2024, 2, 20, 0, 0));
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(Arrays.asList(recurso2));
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }

    @Test
    void search_ShouldCombineMultipleFilters() {
        RecursoSearchDTO searchDTO = new RecursoSearchDTO();
        searchDTO.setTitulo("Cien");
        searchDTO.setVersion(1.0);
        searchDTO.setEstadoSincronizacion(EstadoSincronizacion.PENDIENTE);
        
        when(mongoTemplate.find(any(Query.class), eq(Recurso.class))).thenReturn(Arrays.asList(recurso1));
        
        List<Recurso> result = recursoSearchService.search(searchDTO);
        
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(mongoTemplate, times(1)).find(any(Query.class), eq(Recurso.class));
    }
    
}