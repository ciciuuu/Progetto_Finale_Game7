/* 
// CONFIGURAZIONE LIVELLO

const DIMENSIONE_TILE = 32;
const PUNTO_SPAWN = 500; // ID Spawn Player

// Elenco ID dei blocchi solidi (Muri/Pavimenti Standard - Hitbox 32x32)
const BLOCCHI_SOLIDI = [
    1, 2, 3, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    32, 34, 37, 40,
    41, 43, 45, 47, 49,
    52, 56, 57, 58,
    64, 65, 66, 67, 68, 69, 70,
    76, 77, 78,
    85, 87, 89,
    94, 97, 100
];

// --- NUOVO: Blocchi Piattaforma (Hitbox stretta solo in alto) ---
const BLOCCHI_PIATTAFORMA = [17, 42];
const ALTEZZA_PIATTAFORMA = 15;

const TILESET_KEY = "tiles";
const TILESET_PATH = "assets/images/floors.png";


//  Preload: Carica lo spritesheet 
function godot_preload(s) {
    s.load.spritesheet(TILESET_KEY, TILESET_PATH, {
        frameWidth: DIMENSIONE_TILE,
        frameHeight: DIMENSIONE_TILE
    });
}


// Create: Genera la mappa partendo da 0,0

function godot_create(s) {

    // Controlli di sicurezza
    if (typeof MATRICE === 'undefined') {
        console.error("ERRORE: MATRICE non trovata.");
        return s.physics.add.staticGroup();
    }

    // 1. Inizializzazione
    let gruppoMuri = s.physics.add.staticGroup();
    let rows = MATRICE.length;
    let cols = MATRICE[0].length;

    // Dimensioni Mondo
    let larghezzaMondo = cols * DIMENSIONE_TILE;
    let altezzaMondo = rows * DIMENSIONE_TILE;

    // --- MODIFICA OFFSET NULLO ---
    // Impostiamo i bordi partendo tassativamente da 0,0
    s.physics.world.setBounds(0, 0, larghezzaMondo, altezzaMondo);
    s.cameras.main.setBounds(0, 0, larghezzaMondo, altezzaMondo);

    let visited = Array(rows).fill().map(() => Array(cols).fill(false));

    // ============================================================
    // FASE 1: GRAFICA & SPAWN 
    // ============================================================
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let id = MATRICE[y][x];
            if (id === 0) continue;

            // --- CALCOLO POSIZIONE SEMPLIFICATO (x * DIM) ---
            let posX = x * DIMENSIONE_TILE;
            let posY = y * DIMENSIONE_TILE;

            // -- SPAWN --
            if (id === PUNTO_SPAWN) {
                PP.game_state.set_variable("spawn_x", posX + 16);
                PP.game_state.set_variable("spawn_y", posY);
                continue;
            }

            // -- DISEGNO GRAFICO --
            let tile = s.add.image(posX, posY, TILESET_KEY, id - 1);
            tile.setOrigin(0, 0);
        }
    }

    // ============================================================
    // FASE 1.5: GREEDY MESHING PIATTAFORME
    // ============================================================
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {

            if (visited[y][x] || !BLOCCHI_PIATTAFORMA.includes(MATRICE[y][x])) {
                continue;
            }

            let height = 1;
            let width = 1;
            while (x + width < cols &&
                BLOCCHI_PIATTAFORMA.includes(MATRICE[y][x + width]) &&
                !visited[y][x + width]) {
                width++;
            }

            for (let w = 0; w < width; w++) {
                visited[y][x + w] = true;
            }

            let totalWidth = width * DIMENSIONE_TILE;
            let customHeight = ALTEZZA_PIATTAFORMA;

            // Posizione senza offset
            let finalX = x * DIMENSIONE_TILE;
            let finalY = y * DIMENSIONE_TILE;

            let megaBlock = s.add.zone(finalX, finalY, totalWidth, customHeight);
            megaBlock.setOrigin(0, 0);

            s.physics.add.existing(megaBlock, true);

            megaBlock.body.width = totalWidth;
            megaBlock.body.height = customHeight;
            megaBlock.body.updateFromGameObject();

            gruppoMuri.add(megaBlock);
        }
    }

    // ============================================================
    // FASE 2: GREEDY MESHING STANDARD
    // ============================================================
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {

            if (visited[y][x] || !BLOCCHI_SOLIDI.includes(MATRICE[y][x])) {
                continue;
            }

            let width = 1;
            while (x + width < cols &&
                BLOCCHI_SOLIDI.includes(MATRICE[y][x + width]) &&
                !visited[y][x + width]) {
                width++;
            }

            let height = 1;
            let canExpandHeight = true;
            while (y + height < rows && canExpandHeight) {
                for (let k = 0; k < width; k++) {
                    if (!BLOCCHI_SOLIDI.includes(MATRICE[y + height][x + k]) ||
                        visited[y + height][x + k]) {
                        canExpandHeight = false;
                        break;
                    }
                }
                if (canExpandHeight) {
                    height++;
                }
            }

            for (let h = 0; h < height; h++) {
                for (let w = 0; w < width; w++) {
                    visited[y + h][x + w] = true;
                }
            }

            let totalWidth = width * DIMENSIONE_TILE;
            let totalHeight = height * DIMENSIONE_TILE;

            // Posizione senza offset
            let finalX = x * DIMENSIONE_TILE;
            let finalY = y * DIMENSIONE_TILE;

            let megaBlock = s.add.zone(finalX, finalY, totalWidth, totalHeight);
            megaBlock.setOrigin(0, 0);

            s.physics.add.existing(megaBlock, true);

            megaBlock.body.width = totalWidth;
            megaBlock.body.height = totalHeight;
            megaBlock.body.updateFromGameObject();

            gruppoMuri.add(megaBlock);
        }
    }

    console.log("Livello Generato (Offset rimosso).");
    return gruppoMuri;
}

window.godot_preload = godot_preload;
window.godot_create = godot_create; */




// CONFIGURAZIONE LIVELLO

const DIMENSIONE_TILE = 32;
const PUNTO_SPAWN = 500; // ID Spawn Player

// Elenco ID dei blocchi solidi (Muri/Pavimenti Standard - Hitbox 32x32)
const BLOCCHI_SOLIDI = [
    1, 2, 3, 5, 6, 8, 9, 10,
    11, 12, 13, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 28, 29, 30,
    32, 34, 35, 36, 37, 38, 39, 40,
    44, 45, 46, 47, 48, 49, 50,
    51, 52, 53, 56, 57, 58,
    64, 65, 66, 67, 68, 69, 70,
    71, 72, 73, 74, 76, 77, 78,
    81, 82, 83, 84, 86, 87, 88,
    96, 97, 98
];

// --- NUOVO: Blocchi Piattaforma (Hitbox stretta solo in alto) ---
// Inserisci qui gli ID dei blocchi che vuoi comportino come piattaforme sottili.
// Anche se questi numeri sono presenti in BLOCCHI_SOLIDI, questa lista avrà la precedenza.
const BLOCCHI_PIATTAFORMA = [25, 26, 27, 41, 42, 43];
const ALTEZZA_PIATTAFORMA = 15; // Altezza in pixel della hitbox (attaccata in alto)

const TILESET_KEY = "tiles";
const TILESET_PATH = "assets/images/floors.png";

// Preload: Carica lo spritesheet
function godot_preload(s) {
    s.load.spritesheet(TILESET_KEY, TILESET_PATH, {
        frameWidth: DIMENSIONE_TILE,
        frameHeight: DIMENSIONE_TILE
    });
}

// Create: Genera la mappa usando Greedy Meshing per la fisica
function godot_create(s) {

    // Controlli di sicurezza
    if (typeof MATRICE === 'undefined') {
        console.error("ERRORE: MATRICE non trovata.");
        return s.physics.add.staticGroup();
    }

    // 1. Inizializzazione
    let gruppoMuri = s.physics.add.staticGroup();
    let rows = MATRICE.length;
    let cols = MATRICE[0].length;

    // Dimensioni Mondo
    let larghezzaMondo = cols * DIMENSIONE_TILE;
    let altezzaMondo = rows * DIMENSIONE_TILE;
    let offset_x_pixel = OFFSET_X * DIMENSIONE_TILE;
    let offset_y_pixel = OFFSET_Y * DIMENSIONE_TILE;

    // Bordi del Mondo e Camera
    s.physics.world.setBounds(offset_x_pixel, offset_y_pixel, larghezzaMondo, altezzaMondo);
    s.cameras.main.setBounds(offset_x_pixel, offset_y_pixel, larghezzaMondo, altezzaMondo);

    // Matrice di supporto per tenere traccia dei blocchi fisici già creati
    // (Serve per l'algoritmo Greedy Meshing)
    let visited = Array(rows).fill().map(() => Array(cols).fill(false));

    // ============================================================
    // FASE 1: GRAFICA & SPAWN (Disegniamo tutto singolarmente)
    // ============================================================
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let id = MATRICE[y][x];
            if (id === 0) continue; // Vuoto

            let posX = (x + OFFSET_X) * DIMENSIONE_TILE;
            let posY = (y + OFFSET_Y) * DIMENSIONE_TILE;

            // -- SPAWN --
            if (id === PUNTO_SPAWN) {
                PP.game_state.set_variable("spawn_x", posX + 16);
                PP.game_state.set_variable("spawn_y", posY);
                continue;
            }

            // -- DISEGNO GRAFICO (Semplice immagine per tutti) --
            let tile = s.add.image(posX, posY, TILESET_KEY, id - 1);
            tile.setOrigin(0, 0);
        }
    }

    // ============================================================
    // FASE 1.5: GREEDY MESHING PIATTAFORME (Hitbox sottile in alto)
    // [NUOVO CODICE] Viene eseguito PRIMA dei solidi standard
    // ============================================================
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {

            // Se già visitato o NON è una piattaforma speciale, salta
            if (visited[y][x] || !BLOCCHI_PIATTAFORMA.includes(MATRICE[y][x])) {
                continue;
            }

            // Inizio nuova piattaforma
            // Per le piattaforme, uniamo SOLO orizzontalmente (height fissa a 1)
            // Questo permette di avere più piattaforme una sopra l'altra (es. scale a pioli)
            // senza che vengano fuse in un blocco unico.
            let height = 1;

            // Cerchiamo quanto è largo (espansione orizzontale)
            let width = 1;
            while (x + width < cols &&
                BLOCCHI_PIATTAFORMA.includes(MATRICE[y][x + width]) &&
                !visited[y][x + width]) {
                width++;
            }

            // Marchiamo come visitati i blocchi coperti
            for (let w = 0; w < width; w++) {
                visited[y][x + w] = true;
            }

            // -- CREAZIONE HITBOX PIATTAFORMA --
            let totalWidth = width * DIMENSIONE_TILE;
            // Usiamo l'altezza personalizzata (es. 10px)
            let customHeight = ALTEZZA_PIATTAFORMA;

            let finalX = (x + OFFSET_X) * DIMENSIONE_TILE;
            let finalY = (y + OFFSET_Y) * DIMENSIONE_TILE;

            // Creiamo la zona fisica invisibile
            let megaBlock = s.add.zone(finalX, finalY, totalWidth, customHeight);
            megaBlock.setOrigin(0, 0); // Allineamento in alto a sinistra

            s.physics.add.existing(megaBlock, true); // true = Statico

            megaBlock.body.width = totalWidth;
            megaBlock.body.height = customHeight;
            megaBlock.body.updateFromGameObject();

            // Opzionale: Rimuovi collisione da sotto/lati se vuoi attraversarle saltando da sotto
            // megaBlock.body.checkCollision.down = false;
            // megaBlock.body.checkCollision.left = false;
            // megaBlock.body.checkCollision.right = false;

            gruppoMuri.add(megaBlock);
        }
    }

    // ============================================================
    // FASE 2: GREEDY MESHING STANDARD (Muri Solidi 32x32)
    // Uniamo i blocchi vicini in rettangoli giganti
    // ============================================================
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {

            // Se abbiamo già gestito questo blocco (anche come piattaforma) o non è solido
            if (visited[y][x] || !BLOCCHI_SOLIDI.includes(MATRICE[y][x])) {
                continue;
            }

            // Inizio di un nuovo blocco solido
            // Cerchiamo quanto è largo (espansione orizzontale)
            let width = 1;
            while (x + width < cols &&
                BLOCCHI_SOLIDI.includes(MATRICE[y][x + width]) &&
                !visited[y][x + width]) {
                width++;
            }

            // Cerchiamo quanto è alto questo rettangolo (espansione verticale)
            let height = 1;
            let canExpandHeight = true;
            while (y + height < rows && canExpandHeight) {
                // Controlliamo l'intera riga successiva per vedere se corrisponde alla larghezza
                for (let k = 0; k < width; k++) {
                    if (!BLOCCHI_SOLIDI.includes(MATRICE[y + height][x + k]) ||
                        visited[y + height][x + k]) {
                        canExpandHeight = false;
                        break;
                    }
                }
                if (canExpandHeight) {
                    height++;
                }
            }

            // Marchiamo tutti i blocchi coperti da questo rettangolo come "visitati"
            for (let h = 0; h < height; h++) {
                for (let w = 0; w < width; w++) {
                    visited[y + h][x + w] = true;
                }
            }

            // -- CREAZIONE HITBOX FISICA UNICA --
            // Calcoliamo le dimensioni totali del "mega blocco"
            let totalWidth = width * DIMENSIONE_TILE;
            let totalHeight = height * DIMENSIONE_TILE;
            let finalX = (x + OFFSET_X) * DIMENSIONE_TILE;
            let finalY = (y + OFFSET_Y) * DIMENSIONE_TILE;

            // Creiamo un oggetto invisibile (Zone) per la fisica
            // Usiamo s.add.zone invece di s.add.image perché non serve grafica
            let megaBlock = s.add.zone(finalX, finalY, totalWidth, totalHeight);
            megaBlock.setOrigin(0, 0); // Allineamento in alto a sinistra

            // Aggiungiamo la fisica al blocco gigante
            s.physics.add.existing(megaBlock, true); // true = Statico

            // Ci assicuriamo che il corpo fisico corrisponda alla zona
            megaBlock.body.width = totalWidth;
            megaBlock.body.height = totalHeight;
            megaBlock.body.updateFromGameObject();

            // Lo aggiungiamo al gruppo per le collisioni
            gruppoMuri.add(megaBlock);
        }
    }

    console.log("Livello Generato. Muri ottimizzati (Greedy Meshing) completati.");

    // Restituiamo il gruppo muri a base.js
    return gruppoMuri;
}

window.godot_preload = godot_preload;
window.godot_create = godot_create;


