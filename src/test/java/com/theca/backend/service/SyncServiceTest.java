/**
 * Descripción: test unitario para SyncService.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 1 may 2026
 */

package com.theca.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.theca.backend.dto.sync.CambioDTO;
import com.theca.backend.dto.sync.SyncPullResponseDTO;
import com.theca.backend.dto.sync.SyncPushRequestDTO;
import com.theca.backend.entity.Cola;
import com.theca.backend.enums.EntidadCola;
import com.theca.backend.enums.OperacionCola;
import com.theca.backend.repository.ColaRepository;

@ExtendWith(MockitoExtension.class)
public class SyncServiceTest {

    @Mock
    private ColaRepository colaRepository;

    @InjectMocks
    private SyncService syncService;

    private CambioDTO cambio;

    @BeforeEach
    void setUp() {
        cambio = new CambioDTO();
        
        cambio.setEntidad("RECURSO");
        cambio.setIdEntidad("123");
        cambio.setOperacion("CREATE");
        cambio.setDatosJson("{\"foo\":\"bar\"}");
    }

    @Test
    void pushChanges_ShouldSaveEachCambio() {
        SyncPushRequestDTO req = new SyncPushRequestDTO();
        req.setCambios(Arrays.asList(cambio));

        when(colaRepository.save(any(Cola.class))).thenAnswer(i -> i.getArgument(0));

        syncService.pushChanges(req);

        ArgumentCaptor<Cola> captor = ArgumentCaptor.forClass(Cola.class);
        verify(colaRepository, times(1)).save(captor.capture());

        Cola saved = captor.getValue();
        assertNotNull(saved.getFechaModificacion());
        assertEquals(EntidadCola.RECURSO, saved.getEntidad());
        assertEquals("123", saved.getIdEntidad());
        assertEquals(OperacionCola.CREATE, saved.getOperacion());
        assertEquals("{\"foo\":\"bar\"}", saved.getJsonDatosCambiados());
        assertFalse(saved.isSincronizado());
    }

    @Test
    void pullChanges_ShouldReturnMappedCambios() {
        Cola c1 = new Cola();
        c1.setId("1");
        c1.setEntidad(EntidadCola.ETIQUETA);
        c1.setIdEntidad("e1");
        c1.setOperacion(OperacionCola.UPDATE);
        c1.setJsonDatosCambiados("{\"k\":\"v\"}");
        c1.setFechaModificacion(LocalDateTime.now());
        c1.setSincronizado(false);

        when(colaRepository.findBySincronizadoFalse()).thenReturn(Arrays.asList(c1));

        SyncPullResponseDTO resp = syncService.pullChanges();
        List<com.theca.backend.dto.sync.CambioDTO> cambios = resp.getCambios();

        assertNotNull(cambios);
        assertEquals(1, cambios.size());
        assertEquals("ETIQUETA", cambios.get(0).getEntidad());
        assertEquals("e1", cambios.get(0).getIdEntidad());
        assertEquals("UPDATE", cambios.get(0).getOperacion());
        assertEquals("{\"k\":\"v\"}", cambios.get(0).getDatosJson());
    }

    @Test
    void markAsSynced_ShouldSetSincronizadoTrueAndSave() {
        Cola c = new Cola();
        c.setId("abc");
        c.setSincronizado(false);

        when(colaRepository.findById("abc")).thenReturn(Optional.of(c));

        syncService.markAsSynced(Arrays.asList("abc"));

        verify(colaRepository, times(1)).findById("abc");
        verify(colaRepository, times(1)).save(c);
        assertEquals(true, c.isSincronizado());
    }

}
