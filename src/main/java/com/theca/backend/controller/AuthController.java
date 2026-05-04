/**
 * Descripción: Controlador de autenticación (login/register).
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 19 abr 2026
 */

package com.theca.backend.controller;

import java.time.LocalDateTime;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.theca.backend.dto.login.LoginRequestDTO;
import com.theca.backend.dto.login.LoginResponseDTO;
import com.theca.backend.dto.usuario.CreateUsuarioDTO;
import com.theca.backend.entity.Usuario;
import com.theca.backend.repository.UsuarioRepository;
import com.theca.backend.security.jwt.JwtUtils;
import com.theca.backend.security.services.UserDetailsImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

// Controlador para la autenticación:
@RestController
@Tag(name = "Autenticación", description = "Endpoints para registro y login")
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UsuarioRepository usuarioRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    // Endpoint para login:
    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario y devuelve un token JWT")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login exitoso"),
        @ApiResponse(responseCode = "401", description = "Credenciales inválidas"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequestDTO loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
        	new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        return ResponseEntity.ok(new LoginResponseDTO(jwt,
        											  userDetails.getId(),
        											  userDetails.getUsername(),
        											  userDetails.getEmail(),
        											  Collections.emptyList()));
    }

    // Endpoint para registro:
    @PostMapping("/register")
    @Operation(summary = "Registrar usuario", description = "Crea una nueva cuenta de usuario")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Usuario creado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos o el usuario ya existe"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<?> registerUser(@Valid @RequestBody CreateUsuarioDTO createDTO) {
        if (usuarioRepository.existsByNombre(createDTO.getNombre())) {
            return ResponseEntity.badRequest().body("Error: El usuario ya existe");
        }
        if (usuarioRepository.existsByCorreo(createDTO.getCorreo())) {
            return ResponseEntity.badRequest().body("Error: El correo ya está en uso");
        }

        // Se crea un nuevo usuario:
        Usuario newUsuario = new Usuario();
        newUsuario.setNombre(createDTO.getNombre());
        newUsuario.setCorreo(createDTO.getCorreo());
        newUsuario.setContrasena(encoder.encode(createDTO.getContrasena()));
        newUsuario.setFechaCreacion(LocalDateTime.now());

        usuarioRepository.save(newUsuario);
        return ResponseEntity.status(HttpStatus.CREATED).body("¡Usuario registrado con éxito!");
    }

}