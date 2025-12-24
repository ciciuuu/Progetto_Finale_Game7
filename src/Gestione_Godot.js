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




/* // CONFIGURAZIONE LIVELLO GENERALE
*/

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
const BLOCCHI_PIATTAFORMA = [25, 26, 27, 41, 42, 43];
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
// ORA ACCETTA UN PARAMETRO 'dati_livello' (LIV1, LIV2, o LIV3)
function godot_create(s, dati_livello) {

    // Controlli di sicurezza
    if (!dati_livello || !dati_livello.MATRICE) {
        console.error("ERRORE: Dati livello non validi o non passati.");
        // Fallback su LIV1 se esiste per evitare crash
        if (typeof LIV1 !== 'undefined') dati_livello = LIV1;
        else return s.physics.add.staticGroup();
    }

    // Estraiamo i dati dall'oggetto specifico del livello
    const MATRICE = dati_livello.MATRICE;
    const OFFSET_X = dati_livello.OFFSET_X;
    const OFFSET_Y = dati_livello.OFFSET_Y;

    // 1. Inizializzazione
    let gruppoMuri = s.physics.add.staticGroup();
    let rows = MATRICE.length;
    let cols = MATRICE[0].length;

    // Dimensioni Mondo
    let larghezzaMondo = cols * DIMENSIONE_TILE;
    let altezzaMondo = rows * DIMENSIONE_TILE;

    // Calcolo Offset Pixel
    let start_pixel_x = OFFSET_X * DIMENSIONE_TILE;
    let start_pixel_y = OFFSET_Y * DIMENSIONE_TILE;

    // --- MODIFICA OFFSET NULLO ---
    // Impostiamo i bordi del mondo adattandoli all'offset del livello caricato
    s.physics.world.setBounds(start_pixel_x, start_pixel_y, larghezzaMondo, altezzaMondo);
    s.cameras.main.setBounds(start_pixel_x, start_pixel_y, larghezzaMondo, altezzaMondo);

    let visited = Array(rows).fill().map(() => Array(cols).fill(false));

    // ============================================================
    // FASE 1: GRAFICA & SPAWN 
    // ============================================================
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let id = MATRICE[y][x];
            if (id === 0) continue;

            // --- CALCOLO POSIZIONE CON OFFSET DEL LIVELLO ---
            let posX = (x + OFFSET_X) * DIMENSIONE_TILE;
            let posY = (y + OFFSET_Y) * DIMENSIONE_TILE;

            // -- SPAWN --
            if (id === PUNTO_SPAWN) {
                // Salviamo nello stato globale le coordinate di spawn per questo livello
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

            // Posizione CON offset
            let finalX = (x + OFFSET_X) * DIMENSIONE_TILE;
            let finalY = (y + OFFSET_Y) * DIMENSIONE_TILE;

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

            // Posizione CON offset
            let finalX = (x + OFFSET_X) * DIMENSIONE_TILE;
            let finalY = (y + OFFSET_Y) * DIMENSIONE_TILE;

            let megaBlock = s.add.zone(finalX, finalY, totalWidth, totalHeight);
            megaBlock.setOrigin(0, 0);

            s.physics.add.existing(megaBlock, true);

            megaBlock.body.width = totalWidth;
            megaBlock.body.height = totalHeight;
            megaBlock.body.updateFromGameObject();

            gruppoMuri.add(megaBlock);
        }
    }

    console.log("Livello Generato con successo.");
    return gruppoMuri;
}

window.godot_preload = godot_preload;
window.godot_create = godot_create;