# Módulo de Configuración Avanzada de Torneos Deportivos

## 📋 Descripción General

Este módulo proporciona un sistema completo de configuración de torneos deportivos mediante un flujo wizard de 6 pasos dinámicos. Soporta múltiples formatos de torneos (Round Robin, Fase de Grupos, Eliminatoria Directa y Formato Mixto) con generación automática de calendarios y fixtures.

## 🎯 Características Principales

### ✅ Formatos de Torneo Soportados

1. **Round Robin (Todos contra todos)**
   - Una o dos vueltas
   - Todos los equipos juegan entre sí
   - Ideal para ligas ordinarias

2. **Fase de Grupos**
   - Número configurable de grupos
   - Distribución automática de equipos
   - Clasificados por grupo configurables

3. **Eliminatoria Directa**
   - Emparejamiento ordenado (1º vs último) o aleatorio
   - Soporte para byes (equipos que avanzan automáticamente)
   - Ida y vuelta opcionales
   - Final a uno o dos partidos

4. **Formato Mixto**
   - Combina Fase de Grupos + Eliminatoria
   - Equipos clasificados de grupos avanzan a knockout
   - Configurable de inicio a fin

### 🛠️ Funcionalidades

- ✅ Formularios reactivos dinámicos
- ✅ Validaciones condicionales según tipo de torneo
- ✅ Generación automática de fixtures/calendario
- ✅ Vista previa de partidos (lista y tabla)
- ✅ Cálculo automático de duración del torneo
- ✅ Interfaz tipo wizard con progress bar
- ✅ Navegación entre pasos con validación
- ✅ Revisión completa antes de creación
- ✅ Preparado para integración con backend

## 📁 Estructura de Archivos

```
src/app/
├── pages/tournaments/
│   ├── tournament-wizard.component.ts          # Componente principal del wizard
│   └── tournament-wizard/
│       ├── tournament-basic-info.component.ts        # Paso 1: Información básica
│       ├── tournament-teams-config.component.ts      # Paso 2: Configuración de equipos
│       ├── tournament-format-config.component.ts     # Paso 3: Formato del torneo
│       ├── tournament-calendar-config.component.ts   # Paso 4: Calendario
│       ├── tournament-calendar-preview.component.ts  # Paso 5: Vista previa
│       └── tournament-review.component.ts            # Paso 6: Revisión
│
├── services/
│   ├── tournament-configuration.service.ts     # Gestión de estado del wizard
│   ├── fixture-generation.service.ts           # Generación de fixtures
│   └── tournament-validation.service.ts        # Validaciones personalizadas
│
└── shared/models/
    └── tournament-configuration.ts             # Interfaces TypeScript
```

## 🚀 Uso

### 1. Importar el Componente Principal

En tu `app.routes.ts`:

```typescript
import { TournamentWizardComponent } from './pages/tournaments/tournament-wizard.component';

export const routes: Routes = [
  {
    path: 'tournaments/create',
    component: TournamentWizardComponent
  },
  // ... más rutas
];
```

### 2. Navegar al Wizard

```typescript
// Desde cualquier componente
import { Router } from '@angular/router';

constructor(private router: Router) {}

crearNuevoTorneo() {
  this.router.navigate(['/tournaments/create']);
}
```

### 3. Acceder a los Datos del Wizard

```typescript
import { TournamentConfigurationService } from '@app/services/tournament-configuration.service';

constructor(private configService: TournamentConfigurationService) {}

ngOnInit() {
  // Obtener estado actual
  this.configService.wizardState$.subscribe(state => {
    console.log('Paso actual:', state.currentStep);
    console.log('Completados:', state.completedSteps);
  });

  // Obtener datos de configuración
  const config = this.configService.getConfigurationData();
  console.log('Nombre del torneo:', config.name);
  console.log('Equipo:', config.teams);
}
```

## 📊 Interfaces TypeScript

### TournamentConfigurationData

```typescript
interface TournamentConfigurationData {
  // Información básica
  name: string;
  description?: string;
  location?: string;

  // Configuración de equipos
  teams: TeamEntry[];
  numberOfTeams: number;

  // Formato del torneo
  formatType: TournamentFormatType;
  roundRobinConfig?: RoundRobinConfig;
  groupPhaseConfig?: GroupPhaseConfig;
  knockoutConfig?: KnockoutConfig;
  mixedFormatConfig?: MixedFormatConfig;

  // Configuración del calendario
  calendarConfig: CalendarConfiguration;

  // Calendario generado
  matches?: Match[];

  // Metadatos
  createdAt?: Date;
  updatedAt?: Date;
  status: 'DRAFT' | 'CONFIGURED' | 'IN_PROGRESS' | 'COMPLETED';
}
```

## 🔄 Flujo del Wizard

```
Paso 1: Información Básica
  └─→ Nombre, descripción, ubicación, tipo de torneo
      
Paso 2: Configuración de Equipos
  └─→ Cantidad de equipos, nombres individuales
      
Paso 3: Formato del Torneo
  └─→ Configuración específica según tipo seleccionado
      
Paso 4: Configuración del Calendario
  └─→ Duración, hora inicial, días de juego, pausa entre rondas
      
Paso 5: Vista Previa del Calendario
  └─→ Generación automática de fixtures
      └─→ Vista en lista o tabla
      
Paso 6: Revisión y Confirmación
  └─→ Revisar todos los datos
      └─→ Crear torneo
```

## 🧪 Ejemplo de Uso Completo

```typescript
// Componente que usa el wizard
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TournamentConfigurationService } from '@app/services/tournament-configuration.service';

@Component({
  selector: 'app-tournament-dashboard',
  template: `
    <button (click)="crearTorneo()">
      Crear Nuevo Torneo
    </button>
  `
})
export class TournamentDashboardComponent {
  constructor(
    private router: Router,
    private configService: TournamentConfigurationService
  ) {}

  crearTorneo() {
    // Resetear el wizard si es necesario
    this.configService.resetWizard();
    
    // Navegar al wizard
    this.router.navigate(['/tournaments/create']);
  }

  // Método para gurar un borrador
  guardarBorrador() {
    const config = this.configService.getConfigurationData();
    // Enviar al backend
    localStorage.setItem('tournament-draft', JSON.stringify(config));
  }

  // Método para restaurar un borrador
  restaurarBorrador() {
    const draft = localStorage.getItem('tournament-draft');
    if (draft) {
      const config = JSON.parse(draft);
      this.configService.updateData(config);
    }
  }
}
```

## 🔧 Personalización

### Agregar Validadores Personalizados

```typescript
// Extender TournamentValidationService
export class MiValidacionService extends TournamentValidationService {
  miValidador(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // Tu lógica de validación
      return null;
    };
  }
}
```

### Cambiar Estilos

Los componentes usan estilos encapsulados. Para cambiar el tema global, modifica las variables CSS:

```css
--primary-color: #3498db;
--secondary-color: #95a5a6;
--success-color: #27ae60;
--danger-color: #e74c3c;
```

### Extender la Generación de Fixtures

```typescript
// Extender FixtureGenerationService
export class MiFixtureService extends FixtureGenerationService {
  override generateFixtures(config: TournamentConfigurationData): FixtureGenerationResult {
    // Tu lógica personalizada
    const matches = super.generateFixtures(config).matches;
    // Aplicar ajustes personalizados
    return { success: true, matches };
  }
}
```

## 📡 Integración con Backend

### Ejemplo de Integración

```typescript
// tournament.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TournamentConfigurationService } from '@app/services/tournament-configuration.service';
import { TournamentConfigurationData } from '@app/shared/models/tournament-configuration';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  constructor(
    private http: HttpClient,
    private configService: TournamentConfigurationService
  ) {}

  crearTorneo(config: TournamentConfigurationData) {
    // Preparar datos para envío
    const datosEnvio = {
      name: config.name,
      description: config.description,
      location: config.location,
      type: config.formatType,
      numberOfTeams: config.numberOfTeams,
      // ... más campos
    };

    return this.http.post('/api/tournaments', datosEnvio);
  }

  crearEquipos(torneoId: number, equipos: TeamEntry[]) {
    return this.http.post(
      `/api/tournaments/${torneoId}/teams`,
      { teams: equipos }
    );
  }

  crearPartidos(torneoId: number, partidos: Match[]) {
    return this.http.post(
      `/api/tournaments/${torneoId}/matches`,
      { matches: partidos }
    );
  }
}
```

## 🎨 Interfaz del Usuario

### Paso 1: Información Básica
- Input para nombre del torneo
- Textarea para descripción
- Input para ubicación
- Select para tipo de torneo

### Paso 2: Configuración de Equipos
- Input numérico para cantidad
- Grid de inputs para nombres
- Botón para generar nombres aleatorios
- Barra de progreso

### Paso 3: Formato del Torneo
- Tabs para cada formato
- Inputs dinámicos según formato
- Información sobre ventajas/desventajas
- Cálculos automáticos

### Paso 4: Configuración del Calendario
- Inputs para duración, hora, días
- Selector de días de la semana
- Resumen de duración estimada

### Paso 5: Vista Previa
- Botón para generar fixtures
- Visualización en lista o tabla
- Estadísticas resumidas

### Paso 6: Revisión
- Resumen de todos los datos
- Botón para crear torneo

## 📝 Validaciones

El sistema incluye validaciones automáticas para:

- ✅ Nombre del torneo (3-100 caracteres)
- ✅ Cantidad de equipos (2-128)
- ✅ Distribución en grupos
- ✅ Equipos que avanzan vs total del grupo
- ✅ Potencia de 2 para knockout
- ✅ Duración de partidos (30-180 minutos)
- ✅ Hora en formato válido (HH:MM)
- ✅ Al menos un día de juego seleccionado

## 🐛 Debugging

```typescript
// Habilitar logs de debugging
// En tournament-configuration.service.ts

getCurrentState(): TournamentWizardState {
  const state = this.wizardStateSubject.value;
  console.log('Estado actual:', state);
  return state;
}
```

## 🔐 Seguridad

- Las validaciones se ejecutan tanto en cliente como en servidor
- Los datos se validan en cada paso
- Se incluyen sanitizaciones de inputs
- Compatible con Angular Security Best Practices

## 📚 Referencias

- [Angular Reactive Forms Documentation](https://angular.io/guide/reactive-forms)
- [RxJS Documentation](https://rxjs.dev/)
- [Angular HttpClient Documentation](https://angular.io/guide/http)

## 💡 Consejos y Mejores Prácticas

1. **Guardar Borradores**: Implementa guardado automático de borradores en localStorage
2. **Validación de Backend**: Valida nuevamente en el servidor antes de guardar
3. **Manejo de Errores**: Captura y muestra errores amistosamente al usuario
4. **Responsive**: El wizard es mobile-friendly, pero prueba en dispositivos reales
5. **Accesibilidad**: Todos los inputs tienen labels y aria-labels apropiados

## 🤝 Contribuir

Este módulo es parte del sistema de gestión de torneos deportivos. Para contribuir:

1. Mantén la estructura modular
2. Agrega tests para nuevas funcionalidades
3. Respeta los estilos existentes
4. Documenta cambios significativos

## 📄 Licencia

Este código es parte del proyecto de gestión de torneos comercial.

---

**Versión**: 1.0.0  
**Última actualización**: Junio 2026  
**Mantenedor**: Tu Equipo de Desarrollo

