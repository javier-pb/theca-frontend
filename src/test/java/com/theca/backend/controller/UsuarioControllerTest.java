/**
 * Descripción: test unitario del controlador de la entidad Usuario.
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
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.theca.backend.dto.usuario.CreateUsuarioDTO;
import com.theca.backend.dto.usuario.UpdateUsuarioDTO;
import com.theca.backend.entity.Usuario;
import com.theca.backend.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
public class UsuarioControllerTest {
    
    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private UsuarioController usuarioController;

    private Usuario usuario1;
    private Usuario usuario2;
    
    @BeforeEach
    void setUp() {
        usuario1 = new Usuario();
        usuario1.setId("1");
        usuario1.setNombre("Javier");
        usuario1.setCorreo("javier@email.com");
        usuario1.setContrasena("hash123");
        usuario1.setFechaCreacion(LocalDateTime.now());

        usuario2 = new Usuario();
        usuario2.setId("2");
        usuario2.setNombre("Ana");
        usuario2.setCorreo("ana@email.com");
        usuario2.setContrasena("hash456");
        usuario2.setFechaCreacion(LocalDateTime.now());
    }

    @Test
    void getAll_ShouldReturnListOfUsuarios() {
        List<Usuario> expectedUsuarios = Arrays.asList(usuario1, usuario2);
        when(usuarioRepository.findAll()).thenReturn(expectedUsuarios);

        List<Usuario> actualUsuarios = usuarioController.getAll();

        assertNotNull(actualUsuarios);
        assertEquals(2, actualUsuarios.size());
        assertEquals("Javier", actualUsuarios.get(0).getNombre());
        assertEquals("Ana", actualUsuarios.get(1).getNombre());
        verify(usuarioRepository, times(1)).findAll();
    }

    @Test
    void getAll_ShouldReturnEmptyList_WhenNoUsuarios() {
        when(usuarioRepository.findAll()).thenReturn(Arrays.asList());

        List<Usuario> actualUsuarios = usuarioController.getAll();

        assertNotNull(actualUsuarios);
        assertTrue(actualUsuarios.isEmpty());
        verify(usuarioRepository, times(1)).findAll();
    }

    @Test
    void getById_ShouldReturnUsuario_WhenIdExists() {
        when(usuarioRepository.findById("1")).thenReturn(Optional.of(usuario1));

        ResponseEntity<Usuario> response = usuarioController.getById("1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Javier", response.getBody().getNombre());
        verify(usuarioRepository, times(1)).findById("1");
    }

    @Test
    void getById_ShouldReturnNotFound_WhenIdDoesNotExist() {
        when(usuarioRepository.findById("999")).thenReturn(Optional.empty());

        ResponseEntity<Usuario> response = usuarioController.getById("999");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
        verify(usuarioRepository, times(1)).findById("999");
    }

    @Test
    void create_ShouldSaveAndReturnUsuario() {
        CreateUsuarioDTO inputUsuario = new CreateUsuarioDTO();
        inputUsuario.setNombre("Nuevo Usuario");
        inputUsuario.setCorreo("nuevo@email.com");
        inputUsuario.setContrasena("hash789");

        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario usuarioGuardado = invocation.getArgument(0);
            usuarioGuardado.setId("3");
            return usuarioGuardado;
        });

        Usuario result = usuarioController.create(inputUsuario);

        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals("Nuevo Usuario", result.getNombre());
        assertEquals("nuevo@email.com", result.getCorreo());
        assertNotNull(result.getFechaCreacion());
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    void update_ShouldUpdateAndReturnUsuario_WhenIdExists() {
        UpdateUsuarioDTO updateData = new UpdateUsuarioDTO();
        updateData.setNombre("Nombre Actualizado");
        updateData.setCorreo("actualizado@email.com");

        when(usuarioRepository.findById("1")).thenReturn(Optional.of(usuario1));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario1);

        ResponseEntity<Usuario> response = usuarioController.update("1", updateData);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Nombre Actualizado", response.getBody().getNombre());
        assertEquals("actualizado@email.com", response.getBody().getCorreo());
        verify(usuarioRepository, times(1)).findById("1");
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    void update_ShouldReturnNotFound_WhenIdDoesNotExist() {
        UpdateUsuarioDTO updateData = new UpdateUsuarioDTO();
        updateData.setNombre("Nombre Actualizado");

        when(usuarioRepository.findById("999")).thenReturn(Optional.empty());

        ResponseEntity<Usuario> response = usuarioController.update("999", updateData);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(usuarioRepository, times(1)).findById("999");
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void update_ShouldOnlyUpdateNonNullFields() {
        UpdateUsuarioDTO updateData = new UpdateUsuarioDTO();
        updateData.setNombre("Solo nombre actualizado");

        when(usuarioRepository.findById("1")).thenReturn(Optional.of(usuario1));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario1);

        ResponseEntity<Usuario> response = usuarioController.update("1", updateData);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Solo nombre actualizado", response.getBody().getNombre());
        assertEquals("javier@email.com", response.getBody().getCorreo()); // No cambió
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    void delete_ShouldReturnNoContent_WhenIdExists() {
        when(usuarioRepository.existsById("1")).thenReturn(true);
        doNothing().when(usuarioRepository).deleteById("1");

        ResponseEntity<Void> response = usuarioController.delete("1");

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(usuarioRepository, times(1)).existsById("1");
        verify(usuarioRepository, times(1)).deleteById("1");
    }

    @Test
    void delete_ShouldReturnNotFound_WhenIdDoesNotExist() {
        when(usuarioRepository.existsById("999")).thenReturn(false);

        ResponseEntity<Void> response = usuarioController.delete("999");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(usuarioRepository, times(1)).existsById("999");
        verify(usuarioRepository, never()).deleteById(anyString());
    }
}
