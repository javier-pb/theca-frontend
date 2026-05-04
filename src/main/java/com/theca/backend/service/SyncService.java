/**
 * Descripción: Servicio para gestionar la sincronización offline/online.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 1 may 2026
 */

package com.theca.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.theca.backend.dto.sync.CambioDTO;
import com.theca.backend.dto.sync.SyncPushRequestDTO;
import com.theca.backend.dto.sync.SyncPullResponseDTO;
import com.theca.backend.entity.Cola;
import com.theca.backend.enums.EntidadCola;
import com.theca.backend.enums.OperacionCola;
import com.theca.backend.repository.ColaRepository;

@Service
public class SyncService {

    @Autowired
    private ColaRepository colaRepository;

    // Método que recibe cambios del cliente y los guarda en la cola:
    public void pushChanges(SyncPushRequestDTO request) {
        for (CambioDTO cambio : request.getCambios()) {
            Cola registro = new Cola();
            
            registro.setEntidad(EntidadCola.valueOf(cambio.getEntidad()));
            registro.setIdEntidad(cambio.getIdEntidad());
            registro.setOperacion(OperacionCola.valueOf(cambio.getOperacion()));
            registro.setJsonDatosCambiados(cambio.getDatosJson());
            registro.setFechaModificacion(LocalDateTime.now());
            registro.setSincronizado(false);
            
            colaRepository.save(registro);
        }
    }

    // Método que devuelve los cambios pendientes al cliente:
    public SyncPullResponseDTO pullChanges() {
        List<Cola> pendientes = colaRepository.findBySincronizadoFalse();
        List<CambioDTO> cambios = new ArrayList<>();
        
        for (Cola cola : pendientes) {
            CambioDTO cambio = new CambioDTO();
            
            cambio.setEntidad(cola.getEntidad().name());
            cambio.setIdEntidad(cola.getIdEntidad());
            cambio.setOperacion(cola.getOperacion().name());
            cambio.setDatosJson(cola.getJsonDatosCambiados());
            
            cambios.add(cambio);
        }
        
        return new SyncPullResponseDTO(cambios, LocalDateTime.now().toString());
    }
    
    // Método que marca los cambios como sincronizados (después de confirmar que el cliente los recibió):
    public void markAsSynced(List<String> ids) {
        for (String id : ids) {
            colaRepository.findById(id).ifPresent(cola -> {
                cola.setSincronizado(true);
                colaRepository.save(cola);
            });
        }
    }
    
}