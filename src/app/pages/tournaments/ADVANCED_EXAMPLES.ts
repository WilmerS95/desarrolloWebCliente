/**
 * EJEMPLOS AVANZADOS DE USO DEL MÓDULO DE WIZARD
 *
 * Casos de uso específicos y patrones comunes
 */

// ============================================================================
// EJEMPLO 1: Torneo Round Robin (Liga Tradicional)
// ============================================================================

/**
 * Un torneo de liga tradicional donde todos los equipos juegan
 * contra todos los demás, una o dos veces
 */

export const ejemploLigaTradicial = {
  name: 'Liga Municipal 2026',
  description: 'Torneo de futbol tradicional a nivel municipal',
  location: 'Estadio Municipal',
  formatType: 'ROUND_ROBIN',
  numberOfTeams: 12,
  teams: [
    { name: 'Águilas de Oro' },
    { name: 'Dragones Negros' },
    { name: 'Tigres Azules' },
    { name: 'Panteras Rojas' },
    { name: 'Leones Fuertes' },
    { name: 'Halcones Veloces' },
    { name: 'Osos Grises' },
    { name: 'Jaguares Salvajes' },
    { name: 'Cóndores Altos' },
    { name: 'Bravos del Sur' },
    { name: 'Guerreros del Norte' },
    { name: 'Campeones Unidos' },
  ],
  roundRobinConfig: {
    legs: 2, // Ida y vuelta
  },
  calendarConfig: {
    matchDuration: 90,
    firstMatchStartTime: '15:00',
    playDays: ['Saturday', 'Sunday'],
    matchesPerDay: 3,
    pauseDaysBetweenRounds: 3,
  },
  // Total de partidos: 12 * 11 = 132 partidos
  status: 'DRAFT',
};

// ============================================================================
// EJEMPLO 2: Torneo de Fase de Grupos (Copa del Mundo simulada)
// ============================================================================

/**
 * Torneo con fase de grupos donde equipos se dividen en grupos
 * y los mejores clasifican a una siguiente fase
 */

export const ejemploCopaMundial = {
  name: 'Copa del Mundo 2026',
  description: 'Torneo internacional con fase de grupos',
  location: 'Estadios Varios',
  formatType: 'GROUP_PHASE',
  numberOfTeams: 32,
  teams: Array.from({ length: 32 }, (_, i) => ({
    name: `País ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26)}`,
  })),
  groupPhaseConfig: {
    numberOfGroups: 8,
    teamsPerGroup: 4,
    teamsAdvancingPerGroup: 2,
  },
  calendarConfig: {
    matchDuration: 90,
    firstMatchStartTime: '12:00',
    playDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    matchesPerDay: 4,
    pauseDaysBetweenRounds: 1,
  },
  // Partidos por grupo: 6 (4 equipos, todos contra todos)
  // Total en grupos: 8 * 6 = 48 partidos
  status: 'DRAFT',
};

// ============================================================================
// EJEMPLO 3: Torneo de Eliminatoria Directa (Copa Rápida)
// ============================================================================

/**
 * Torneo de eliminación simple donde un equipo pierde y queda fuera
 * Ideal para eventos rápidos y emocionantes
 */

export const ejemploCopaCopa = {
  name: 'Copa Rápida 2026',
  description: 'Torneo de eliminatoria directa, ganador se lleva todo',
  location: 'Estadio Principal',
  formatType: 'KNOCKOUT',
  numberOfTeams: 16,
  teams: Array.from({ length: 16 }, (_, i) => ({
    name: `Equipo ${i + 1}`,
  })),
  knockoutConfig: {
    pairingType: 'FIRST_VS_LAST', // 1º vs 16º, 2º vs 15º, etc.
    allowByes: false,
    twoLegs: true, // Ida y vuelta en llaves preliminares
    finalTwoLegs: false, // Final a un solo partido
  },
  calendarConfig: {
    matchDuration: 90,
    firstMatchStartTime: '19:00',
    playDays: ['Saturday', 'Sunday'],
    matchesPerDay: 2,
    pauseDaysBetweenRounds: 7,
  },
  // Partidos: 15 (eliminatoria directa con 16 equipos)
  status: 'DRAFT',
};

// ============================================================================
// EJEMPLO 4: Torneo Mixto (Grupos + Eliminatoria)
// ============================================================================

/**
 * Lo mejor de ambos mundos: fase de grupos para garantizar
 * que todos jueguen, y luego eliminatoria directa
 */

export const ejemploTorneoMixto = {
  name: 'Campeonato Nacional 2026',
  description: 'Fase de grupos + Eliminatoria directa',
  location: 'Estadios Regionales',
  formatType: 'MIXED',
  numberOfTeams: 24,
  teams: Array.from({ length: 24 }, (_, i) => ({
    name: `Club ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
  })),
  mixedFormatConfig: {
    groupPhase: {
      numberOfGroups: 4,
      teamsPerGroup: 6,
      teamsAdvancingPerGroup: 2,
    },
    knockout: {
      pairingType: 'FIRST_VS_LAST',
      allowByes: false,
      twoLegs: true,
      finalTwoLegs: true,
    },
    teamsAdvancingToKnockout: 8,
  },
  calendarConfig: {
    matchDuration: 90,
    firstMatchStartTime: '14:00',
    playDays: ['Wednesday', 'Friday', 'Saturday', 'Sunday'],
    matchesPerDay: 3,
    pauseDaysBetweenRounds: 2,
  },
  // Fase de grupos: 4 * 15 = 60 partidos (6 equipos por grupo)
  // Cuartos: 4 partidos
  // Semis: 4 partidos (2 ida y vuelta)
  // Final: 2 partidos (ida y vuelta)
  // Total: 70 partidos
  status: 'DRAFT',
};

// ============================================================================
// EJEMPLO 5: Torneo Pequeño (Papi Fútbol)
// ============================================================================

/**
 * Torneo pequeño para categoría de papi fútbol
 * Menos equipos, horarios flexibles
 */

export const ejemploPapiFutbol = {
  name: 'Torneo Papi Fútbol 2026',
  description: 'Torneo amistoso para padres de la comunidad',
  location: 'Cancha Comunitaria',
  formatType: 'ROUND_ROBIN',
  numberOfTeams: 6,
  teams: [
    { name: 'Papás Atrevidos' },
    { name: 'Veteranos FC' },
    { name: 'El Equipo Viejo' },
    { name: 'Experiencia Pura' },
    { name: 'Jóvenes Espíritus' },
    { name: 'United Papás' },
  ],
  roundRobinConfig: {
    legs: 1, // Una sola vuelta (más rápido)
  },
  calendarConfig: {
    matchDuration: 60, // Partidos más cortos
    firstMatchStartTime: '10:00',
    playDays: ['Saturday', 'Sunday'],
    matchesPerDay: 2,
    pauseDaysBetweenRounds: 7,
  },
  // Total: 15 partidos (6 equipos, todos contra todos)
  status: 'DRAFT',
};

// ============================================================================
// EJEMPLO 6: Usar el Wizard Programáticamente
// ============================================================================

import { Component } from '@angular/core';
import { TournamentConfigurationService } from '@app/services/tournament-configuration.service';
import { FixtureGenerationService } from '@app/services/fixture-generation.service';

@Component({
  selector: 'app-tournament-auto-config',
  template: `
    <button (click)="crearTorneoAutomaticamente()">
      Crear Torneo Automáticamente
    </button>
  `
})
export class TournamentAutoConfigComponent {
  constructor(
    private configService: TournamentConfigurationService,
    private fixtureService: FixtureGenerationService
  ) {}

  crearTorneoAutomaticamente() {
    // Resetear wizard
    this.configService.resetWizard();

    // Cargar configuración predefinida
    const config = { ...ejemploLigaTradicial };

    // Actualizar el servicio con la configuración
    this.configService.updateData(config);

    // Generar fixtures automáticamente
    const result = this.fixtureService.generateFixtures(config);

    if (result.success) {
      this.configService.updateData({
        matches: result.matches
      });
      console.log('Torneo configurado automáticamente');
      console.log(`Total de partidos generados: ${result.matches.length}`);
    } else {
      console.error('Error al generar fixtures:', result.errors);
    }
  }

  /**
   * Ejemplo: Crear torneo a partir de datos externos
   */
  crearTorneoDesdeAPI(datosDelBackend: any) {
    this.configService.updateData({
      name: datosDelBackend.nombre,
      description: datosDelBackend.descripcion,
      numberOfTeams: datosDelBackend.equipos.length,
      teams: datosDelBackend.equipos.map((e: any) => ({
        name: e.nombreEquipo,
        id: e.equipoId
      })),
      formatType: datosDelBackend.formato,
      // ... mapear más campos
    });
  }
}

// ============================================================================
// EJEMPLO 7: Validaciones Personalizadas
// ============================================================================

import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { TournamentValidationService } from '@app/services/tournament-validation.service';

@Injectable({
  providedIn: 'root'
})
export class MisValidacionesTorneos extends TournamentValidationService {
  /**
   * Validar que el nombre no tenga caracteres especiales
   */
  nombreSinEspeciales(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const regex = /^[a-zA-Z0-9\s\-áéíóúñÁÉÍÓÚÑ]+$/;
      if (!regex.test(control.value)) {
        return { caracteresEspeciales: true };
      }

      return null;
    };
  }

  /**
   * Validar que al menos haya un día de juego en fin de semana
   */
  minUnoDiaFinDeSemana(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const diasSeleccionados = control.value as string[];
      if (!diasSeleccionados) {
        return null;
      }

      const diasFinDeSemana = ['Saturday', 'Sunday'];
      const tieneFinDeSemana = diasSeleccionados.some(dia =>
        diasFinDeSemana.includes(dia)
      );

      if (!tieneFinDeSemana) {
        return { sinFinDeSemana: true };
      }

      return null;
    };
  }
}

// ============================================================================
// EJEMPLO 8: Guardar y Restaurar Configuración
// ============================================================================

import { Injectable } from '@angular/core';
import { TournamentConfigurationData } from '@app/shared/models/tournament-configuration';

@Injectable({
  providedIn: 'root'
})
export class TournamentConfigStorage {
  /**
   * Guardar configuración completa en localStorage
   */
  guardarConfiguracion(nombre: string, config: TournamentConfigurationData) {
    const clave = `torneo_${nombre}_${Date.now()}`;
    localStorage.setItem(clave, JSON.stringify(config));
    this.agregarAIndice(clave, nombre);
    console.log('Configuración guardada:', clave);
  }

  /**
   * Restaurar configuración guardada
   */
  restaurarConfiguracion(clave: string): TournamentConfigurationData | null {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : null;
  }

  /**
   * Listar todas las configuraciones guardadas
   */
  listarConfiguraciones(): Array<{ clave: string; nombre: string; fecha: Date }> {
    const indice = localStorage.getItem('torneo_indice');
    if (!indice) return [];

    const items = JSON.parse(indice);
    return items.map((item: any) => ({
      ...item,
      fecha: new Date(item.fecha)
    }));
  }

  /**
   * Eliminar una configuración guardada
   */
  eliminarConfiguracion(clave: string) {
    localStorage.removeItem(clave);
    this.removerDelIndice(clave);
  }

  private agregarAIndice(clave: string, nombre: string) {
    const indice = localStorage.getItem('torneo_indice') || '[]';
    const items = JSON.parse(indice);
    items.push({
      clave,
      nombre,
      fecha: new Date().toISOString()
    });
    localStorage.setItem('torneo_indice', JSON.stringify(items));
  }

  private removerDelIndice(clave: string) {
    const indice = localStorage.getItem('torneo_indice') || '[]';
    const items = JSON.parse(indice).filter((item: any) => item.clave !== clave);
    localStorage.setItem('torneo_indice', JSON.stringify(items));
  }
}

// ============================================================================
// EJEMPLO 9: Exportar/Importar Configuración en JSON
// ============================================================================

export class TournamentConfigExporter {
  /**
   * Exportar configuración a JSON
   */
  static exportarJSON(config: TournamentConfigurationData, nombreArchivo: string) {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `${nombreArchivo}_${Date.now()}.json`;
    enlace.click();

    window.URL.revokeObjectURL(url);
  }

  /**
   * Importar configuración desde JSON
   */
  static importarJSON(archivo: File): Promise<TournamentConfigurationData> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();

      lector.onload = (e) => {
        try {
          const datos = JSON.parse(e.target?.result as string);
          resolve(datos as TournamentConfigurationData);
        } catch (error) {
          reject(new Error('Error al parsear JSON'));
        }
      };

      lector.onerror = () => {
        reject(new Error('Error al leer archivo'));
      };

      lector.readAsText(archivo);
    });
  }

  /**
   * Exportar configuración a CSV (para equipos)
   */
  static exportarEquiposCSV(config: TournamentConfigurationData) {
    const headers = ['Número', 'Nombre del Equipo'];
    const rows = config.teams.map((team, i) => [i + 1, team.name]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `equipos_${Date.now()}.csv`;
    enlace.click();

    window.URL.revokeObjectURL(url);
  }
}

// ============================================================================
// EJEMPLO 10: Monitoreo de Cambios
// ============================================================================

import { Component } from '@angular/core';
import { TournamentConfigurationService } from '@app/services/tournament-configuration.service';

@Component({
  selector: 'app-tournament-monitor',
  template: `
    <div class="monitor">
      <h3>Monitor de Cambios</h3>
      <pre>{{ estadoActual | json }}</pre>
    </div>
  `
})
export class TournamentMonitorComponent {
  estadoActual: any;

  constructor(private configService: TournamentConfigurationService) {
    this.configService.wizardState$.subscribe(estado => {
      this.estadoActual = {
        paso: estado.currentStep,
        completados: Array.from(estado.completedSteps),
        errores: Array.from(estado.errors.entries()),
        datos: {
          nombre: estado.data.name,
          equipos: estado.data.numberOfTeams,
          formato: estado.data.formatType,
          partidos: estado.data.matches?.length || 0
        }
      };
    });
  }
}

// ============================================================================
// FIN DE EJEMPLOS AVANZADOS
// ============================================================================

