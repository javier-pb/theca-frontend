/**
 * Descripción: test unitario para la clase SyncController.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 1 may 2026
 * 
 */

package com.theca.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.theca.backend.dto.sync.CambioDTO;
import com.theca.backend.dto.sync.SyncPullResponseDTO;
import com.theca.backend.dto.sync.SyncPushRequestDTO;
import com.theca.backend.service.SyncService;

@ExtendWith(MockitoExtension.class)
public class SyncControllerTest {

    @Mock
    private SyncService syncService;

    @InjectMocks
    private SyncController syncController;

    private SyncPushRequestDTO pushReq;

    @BeforeEach
    void setUp() {
        CambioDTO c = new CambioDTO();
        
        c.setEntidad("RECURSO");
        c.setIdEntidad("1");
        c.setOperacion("CREATE");
        c.setDatosJson("{}");

        pushReq = new SyncPushRequestDTO();
        pushReq.setCambios(Arrays.asList(c));
    }

    // Test para verificar que el método pushChanges devuelve OK y llama al servicio:
    @Test
    void pushChanges_ShouldReturnOk() {
        ResponseEntity<Void> resp = syncController.pushChanges(pushReq);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        verify(syncService, times(1)).pushChanges(pushReq);
    }

    // Test para verificar que el método pullChanges devuelve OK y el DTO esperado:
    @Test
    void pullChanges_ShouldReturnResponse() {
        SyncPullResponseDTO dto = new SyncPullResponseDTO();
        when(syncService.pullChanges()).thenReturn(dto);

        ResponseEntity<SyncPullResponseDTO> resp = syncController.pullChanges();
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals(dto, resp.getBody());
        verify(syncService, times(1)).pullChanges();
    }

    // Test para verificar que el método confirmSync devuelve OK y llama al servicio con los IDs:
    @Test
    void confirmSync_ShouldInvokeMarkAsSynced() {
        List<String> ids = Arrays.asList("a", "b");
        ResponseEntity<Void> resp = syncController.confirmSync(ids);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        verify(syncService, times(1)).markAsSynced(ids);
    }

}
