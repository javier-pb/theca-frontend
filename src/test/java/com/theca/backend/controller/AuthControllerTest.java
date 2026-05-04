/**
 * Descripción: test unitario para la clase AuthController.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 20 abr 2026
 * 
 */

package com.theca.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.theca.backend.dto.login.LoginRequestDTO;
import com.theca.backend.dto.login.LoginResponseDTO;
import com.theca.backend.dto.usuario.CreateUsuarioDTO;
import com.theca.backend.entity.Usuario;
import com.theca.backend.repository.UsuarioRepository;
import com.theca.backend.security.jwt.JwtUtils;
import com.theca.backend.security.services.UserDetailsImpl;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthController authController;

    // Test para verificar que se devuelve un token JWT correcto cuando las credenciales son válidas:
    @Test
    void authenticateUser_ShouldReturnToken_WhenCredentialsAreValid() {
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setUsername("Javier");
        loginRequest.setPassword("123456");
        
        UserDetailsImpl userDetails = new UserDetailsImpl("1", "Javier", "javier@email.com", "hash123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("Token JWT falso");

        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody() instanceof LoginResponseDTO);
        LoginResponseDTO loginResponse = (LoginResponseDTO) response.getBody();
        assertEquals("Token JWT falso", loginResponse.getToken());
    }

    // Test para verificar que se devuelve un 200 OK cuando se registra un nuevo usuario:
    @Test
    void registerUser_ShouldReturnOk_WhenUserIsNew() {
    	CreateUsuarioDTO createDTO = new CreateUsuarioDTO();
    	createDTO.setNombre("Nuevo");
    	createDTO.setCorreo("nuevo@email.com");
    	createDTO.setContrasena("password");

        when(usuarioRepository.existsByNombre("Nuevo")).thenReturn(false);
        when(usuarioRepository.existsByCorreo("nuevo@email.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(new Usuario());

        ResponseEntity<?> response = authController.registerUser(createDTO);

        assertEquals(201, response.getStatusCode().value());
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    // Test para verificar que se devuelve un error 400 cuando el nombre de usuario ya existe al registrarlo:
    @Test
    void registerUser_ShouldReturnBadRequest_WhenUsernameExists() {
    	CreateUsuarioDTO createDTO = new CreateUsuarioDTO();
    	createDTO.setNombre("Existente");
    	createDTO.setCorreo("nuevo@email.com");

        when(usuarioRepository.existsByNombre("Existente")).thenReturn(true);

        ResponseEntity<?> response = authController.registerUser(createDTO);

        assertEquals(400, response.getStatusCode().value());
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

}