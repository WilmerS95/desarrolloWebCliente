# 🏗️ ARQUITECTURA DEL MÓDULO DE WIZARD DE TORNEOS

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TOURNAMENT WIZARD COMPONENT                       │
│                     (Orquestador Principal)                          │
└────────────────────────┬────────────────────────────────────────────┘
                         │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌─────────┐    ┌──────────────┐   ┌──────────────┐
   │States   │    │Navigation    │   │Rendering     │
   │ Manage  │    │& Progress    │   │Components    │
   └─────────┘    └──────────────┘   └──────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│        TOURNAMENT CONFIGURATION SERVICE (State)              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ BehaviorSubject: wizardState$ (Observable)           │    │
│  │  - currentStep                                       │    │
│  │  - completedSteps                                    │    │
│  │  - data (TournamentConfigurationData)               │    │
│  │  - errors (Map<string, string[]>)                   │    │
│  └─────────────────────────────────────────────────────┘    │
└──────┬──────────────────────────┬──────────────────────────┘
       │                          │
       ▼                          ▼
┌──────────────────┐    ┌──────────────────────┐
│Navigation Methods│    │Data Update Methods   │
├──────────────────┤    ├──────────────────────┤
│nextStep()        │    │updateData()          │
│previousStep()    │    │updateData(partial)   │
│goToStep(n)       │    │setErrors()           │
│resetWizard()     │    │clearErrors()         │
└──────────────────┘    └──────────────────────┘
```

## Flujo de Pasos

```
┌───────────────────────────────────────────────────────────────────────┐
│                         TOURNAMENT WIZARD FLOW                          │
└───────────────────────────────────────────────────────────────────────┘

                                    START
                                      │
                ┌─────────────────────┴──────────────────────┐
                │                                             │
                ▼                                             ▼
        ┌───────────────────┐                    ┌────────────────────┐
        │  VALID WIZARD?    │                    │  RESTORED DRAFT?   │
        └─────────┬─────────┘                    └──────────┬─────────┘
                  │                                         │
                  ├─NO─────────────────────────┬───────YES──┤
                  │                            │            │
                  ▼                            ▼            ▼
             ┌─────────────┐          ┌───────────────┐   RESTORE
             │   RESET     │          │ LOAD DRAFT    │   DRAFT
             └────┬────────┘          └───────┬───────┘   CONFIG
                  │                           │
                  └──────────────┬────────────┘
                                 ▼
        ┌──────────────────────────────────────────────────┐
        │  PASO 1: INFORMACIÓN BÁSICA                      │
        │  - Nombre, Descripción, Ubicación                │
        │  - Tipo de Torneo (selector)                     │
        │  ✓ Validación: nombre requerido (3-100 chars)   │
        └──────────┬───────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────────────────────┐
        │  PASO 2: CONFIGURACIÓN DE EQUIPOS                │
        │  - Cantidad de equipos (input)                   │
        │  - Nombres individuales (grid)                   │
        │  - Botón: generar nombres aleatorios             │
        │  ✓ Validación: 2-128 equipos, nombres únicos     │
        └──────────┬───────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────────────────────┐
        │  PASO 3: FORMATO DEL TORNEO                      │
        │  ┌─────────────────────────────────────────┐     │
        │  │ Round Robin    │ Grupo │ Knockout │Mix │ │    │
        │  └─────────────────────────────────────────┘     │
        │                                                   │
        │  Configuración dinámica según tipo:              │
        │  • RoundRobin: legs (1 o 2)                      │
        │  • Grupos: # grupos, equipos/grupo, clasificados │
        │  • Knockout: emparejamiento, byes, 2legs, final  │
        │  • Mixto: grupos + knockout, equipos que avanzan │
        │  ✓ Validación: configuración específica          │
        └──────────┬───────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────────────────────┐
        │  PASO 4: CONFIGURACIÓN DE CALENDARIO             │
        │  - Duración partidos (30-180 min)                │
        │  - Hora inicio (time picker)                     │
        │  - Partidos por día (1-10)                       │
        │  - Días de juego (checkboxes)                    │
        │  - Pausa entre rondas (0-10 días)                │
        │  ✓ Validación: valores en rango                  │
        │  📊 Preview: duración estimada                   │
        └──────────┬───────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────────────────────┐
        │  PASO 5: VISTA PREVIA DE CALENDARIO              │
        │  ┌─────────────────────────────────────────┐     │
        │  │ [Generar Calendario]                    │     │
        │  │ Algoritmo: FixtureGenerationService     │     │
        │  └─────────────────────────────────────────┘     │
        │                                                   │
        │  Mostrar generado:                               │
        │  • Vista en LISTA (tarjetas por ronda)           │
        │  • Vista en TABLA (filas por partido)            │
        │  • Estadísticas:                                 │
        │    - Total partidos                              │
        │    - Cantidad de rondas                          │
        │    - Duración (días)                             │
        │    - Partidos programados                        │
        │  ✓ Validación: matches.length > 0               │
        └──────────┬───────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────────────────────┐
        │  PASO 6: REVISIÓN FINAL                          │
        │  ┌─────────────────────────────────────────┐     │
        │  │ Tarjetas de información:                │     │
        │  │ • Información Básica                    │     │
        │  │ • Equipos (grid)                        │     │
        │  │ • Configuración del Formato             │     │
        │  │ • Configuración del Calendario          │     │
        │  │ • Resumen de Partidos (estadísticas)    │     │
        │  └─────────────────────────────────────────┘     │
        │                                                   │
        │  ✓ Validación Final: validar todo               │
        │  🎬 Acción: Crear Torneo                        │
        └──────────┬───────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────────────────────┐
        │  ENVÍO A BACKEND (POST)                          │
        │  /api/tournaments                                │
        │  {                                               │
        │    name, description, location,                  │
        │    formatType, calendarConfig,                   │
        │    numberOfTeams, teams[], matches[]             │
        │  }                                               │
        └──────────┬───────────────────────────────────────┘
                   │
        ┌──────────┴──────────────┐
        │                         │
        ▼                         ▼
    ┌────────┐             ┌───────────┐
    │ SUCCESS │             │  ERROR    │
    └────┬───┘             └─────┬─────┘
         │ Navegar a torneo      │ Mostrar error
         │ Resetear wizard       │ Permitir reintentar
         │                       │
         ▼                       ▼
      [END]                   [RETRY]
```

## Estructura de Datos (TournamentConfigurationData)

```
TournamentConfigurationData
│
├── INFORMACIÓN BÁSICA
│   ├── name: string
│   ├── description?: string
│   ├── location?: string
│   └── status: 'DRAFT' | 'CONFIGURED' | 'IN_PROGRESS' | 'COMPLETED'
│
├── EQUIPOS
│   ├── numberOfTeams: number
│   └── teams: TeamEntry[]
│       └── TeamEntry
│           ├── id?: number
│           ├── name: string
│           └── groupAssignedTo?: number
│
├── FORMATO DEL TORNEO
│   ├── formatType: TournamentFormatType
│   │   ├── 'ROUND_ROBIN'
│   │   ├── 'GROUP_PHASE'
│   │   ├── 'KNOCKOUT'
│   │   └── 'MIXED'
│   │
│   ├── roundRobinConfig?: RoundRobinConfig
│   │   └── legs: 1 | 2
│   │
│   ├── groupPhaseConfig?: GroupPhaseConfig
│   │   ├── numberOfGroups: number
│   │   ├── teamsPerGroup: number
│   │   ├── teamsAdvancingPerGroup: number
│   │   └── groups?: GroupConfiguration[]
│   │
│   ├── knockoutConfig?: KnockoutConfig
│   │   ├── pairingType: 'FIRST_VS_LAST' | 'RANDOM'
│   │   ├── allowByes: boolean
│   │   ├── twoLegs: boolean
│   │   └── finalTwoLegs: boolean
│   │
│   └── mixedFormatConfig?: MixedFormatConfig
│       ├── groupPhase: GroupPhaseConfig
│       ├── knockout: KnockoutConfig
│       └── teamsAdvancingToKnockout: number
│
├── CALENDARIO
│   └── calendarConfig: CalendarConfiguration
│       ├── matchDuration: number (minutos)
│       ├── firstMatchStartTime: string (HH:MM)
│       ├── playDays: string[] (ej: ['Saturday', 'Sunday'])
│       ├── matchesPerDay: number
│       └── pauseDaysBetweenRounds?: number
│
└── PARTIDOS GENERADOS
    └── matches?: Match[]
        └── Match
            ├── id?: number
            ├── matchNumber: number
            ├── round: number
            ├── homeTeam: TeamEntry
            ├── awayTeam: TeamEntry
            ├── scheduledDate?: Date
            ├── scheduledTime?: string
            ├── homeTeamGoals?: number
            ├── awayTeamGoals?: number
            ├── status: 'PENDING' | 'PLAYED' | 'CANCELLED'
            ├── isKnockoutMatch?: boolean
            └── isFinal?: boolean
```

## Flujo de Servicios

```
┌────────────────────────────────────────────────────────────┐
│          USER INTERACTION                                  │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────────┐
    │  COMPONENT (Formulario)                  │
    │  - Captura input de usuario              │
    │  - Crea FormGroup                        │
    │  - Emite eventos (next, previous)        │
    └────┬────────────────────────────────────┘
         │
         ├─────────────────────────┬──────────────────────────┐
         │                         │                          │
         ▼                         ▼                          ▼
    ┌──────────────────┐  ┌─────────────────────┐  ┌──────────────────┐
    │VALIDATION SERVICE│  │CONFIGURATION SERVICE│  │ACTION (NEXT/PREV)│
    │                  │  │                     │  │                  │
    │validateStep()    │  │updateData()         │  │nextStep()        │
    │getErrorMessage() │  │updateData(partial)  │  │previousStep()    │
    └─────────┬────────┘  │setErrors()          │  │goToStep(n)       │
              │           │validateStep()       │  │resetWizard()     │
              │           └──────────┬──────────┘  │saveConfiguration()
              │                      │            └─────────┬─────────┘
              │                      │                      │
              └──────────┬───────────┴──────────────────────┘
                         │
                         ▼
             ┌───────────────────────────┐
             │ BehaviorSubject           │
             │ wizardState$              │
             │ (nueva emisión)           │
             └───────────────────────────┘
                         │
    ┌────────────────────┴────────────────────┐
    │                                         │
    ▼                                         ▼
RECALCULAR COMPONENTES              FIXTURE GENERATION SERVICE
(Con nuevos datos)                   (Si es Paso 5)
    │                                        │
    └────────┬─────────────────────────────┬─┘
             │                             │
             ▼                             ▼
         ┌─────────────┐          ┌──────────────────┐
         │ NUEVA VISTA │          │ generateFixtures()
         │             │          │                  │
         │ Actualizada │          │ • RoundRobin()   │
         │ con datos   │          │ • GroupPhase()   │
         │ nuevos      │          │ • Knockout()     │
         └─────────────┘          │ • MixedFormat()  │
                                  │                  │
                                  │ Retorna:         │
                                  │ FixtureResult    │
                                  │ ├─ success       │
                                  │ ├─ matches[]     │
                                  │ └─ errors[]      │
                                  └──────────────────┘
```

## Arquitectura de Componentes

```
tournament-wizard.component (MAIN ORCHESTRATOR)
│
├── Stepper UI
│   ├── Progress Bar
│   └── Step Buttons
│
├── Router Outlet / Switch Statement
│   │
│   ├── Step 1: tournament-basic-info.component
│   │   ├── Inputs: name, description, location
│   │   ├── Select: formatType
│   │   └── Help: Description dinámico
│   │
│   ├── Step 2: tournament-teams-config.component
│   │   ├── Input: numberOfTeams
│   │   ├── Grid: Team Names
│   │   ├── Actions: Generate Random, Clear All
│   │   └── Progress: Teams Status Bar
│   │
│   ├── Step 3: tournament-format-config.component
│   │   ├── Tabs: Format Type Selector
│   │   └── Conditional Inputs (según formato)
│   │
│   ├── Step 4: tournament-calendar-config.component
│   │   ├── Inputs: Duration, Time, Matches/Day
│   │   ├── Checkboxes: Play Days
│   │   ├── Summary: Duration Estimate
│   │   └── Help: Tips
│   │
│   ├── Step 5: tournament-calendar-preview.component
│   │   ├── Button: Generate Fixtures
│   │   ├── Toggle: List/Table View
│   │   ├── Matches Display
│   │   └── Statistics
│   │
│   └── Step 6: tournament-review.component
│       ├── Summary Cards
│       ├── All Configuration Data
│       └── Confirmation Box
│
└── Action Buttons
    ├── Cancel
    ├── Previous/Next
    └── Create Tournament
```

## Ciclo de Vida

```
Component Mount
│
├─ Leer TournamentConfigurationService
│  └─ Obtener estado actual
│
├─ FormBuilder.group() create FormGroup
│
├─ patchValue() con datos guardados
│
├─ valueChanges.subscribe()
│  └─ Actualizar configService al cambiar
│
├─ Validaciones dinámicas
│
└─ render()

Component Unmount / Destroy
│
├─ unsubscribe (takeUntil)
│
└─ Opcionalmente guardar borrador
```

## Mapeo de Errores

```
VALIDACIONES POR PASO:

PASO 1 (Info Básica)
├─ name: [required, minLength(3), maxLength(100), noStartWithNumber]
├─ formatType: [required]
└─ Errores: Map<string, string[]>

PASO 2 (Equipos)
├─ numberOfTeams: [required, min(2), max(128), validCount]
├─ teams: [array of { name: required, minLength(2) }]
└─ Errores: exactMatch entre numberOfTeams y teams.length

PASO 3 (Formato)
├─ RoundRobin: legs [required]
├─ GroupPhase: groups, teamsPerGroup, advanced
├─ Knockout: pairingType, allowByes, twoLegs, finalTwoLegs
├─ Mixed: groupPhase + knockout + teamsAdvancingToKnockout
└─ Errores: Validaciones específicas de cada formato

PASO 4 (Calendario)
├─ matchDuration: [required, min(30), max(180)]
├─ firstMatchStartTime: [required, timeFormat]
├─ matchesPerDay: [required, min(1), max(10)]
├─ playDays: [required, minItems(1)]
└─ Errores: Fuera de rango

PASO 5 (Preview)
├─ matches: [required, minItems(1)]
└─ Errores: Sin fixtures generados

PASO 6 (Review)
├─ Validación final completa
└─ Errores: Cualquier error anterior
```

---

## 📊 Diagrama de Dependencias

```
app
│
├── tournament-wizard.component
│   ├── TournamentConfigurationService
│   ├── FixtureGenerationService
│   ├── TournamentValidationService
│   │
│   ├── tournament-basic-info.component
│   │   ├── FormBuilder
│   │   ├── TournamentValidationService
│   │   └── TournamentConfigurationService
│   │
│   ├── tournament-teams-config.component
│   │   ├── FormBuilder
│   │   ├── TournamentValidationService
│   │   └── TournamentConfigurationService
│   │
│   ├── tournament-format-config.component
│   │   ├── FormBuilder
│   │   ├── TournamentValidationService
│   │   └── TournamentConfigurationService
│   │
│   ├── tournament-calendar-config.component
│   │   ├── FormBuilder
│   │   ├── TournamentValidationService
│   │   └── TournamentConfigurationService
│   │
│   ├── tournament-calendar-preview.component
│   │   ├── FixtureGenerationService
│   │   └── TournamentConfigurationService
│   │
│   └── tournament-review.component
│       └── TournamentConfigurationService
│
└── Services
    ├── tournament-configuration.service
    │   └── BehaviorSubject<TournamentWizardState>
    │
    ├── fixture-generation.service
    │   └── TournamentConfigurationData → FixtureGenerationResult
    │
    └── tournament-validation.service
        └── ValidatorFn, ValidationErrors, custom validators
```

---

**Última actualización**: Junio 2026  
**Versión**: 1.0.0  
**Estado**: ✅ Completado

