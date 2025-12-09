
// CONFIGURAZIONE LIVELLO

const DIMENSIONE_TILE = 32; 
const PUNTO_SPAWN = 500; // ID Spawn Player

// const PUNTO_SPAWN = 600; // ID Spawn Player
// Elenco ID dei blocchi solidi (Muri/Pavimenti)
const BLOCCHI_SOLIDI = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    32, 33, 34, 35, 36, 37, 38, 40,
    41, 42, 43, 44, 52, 54
];
const TILESET_KEY = "tiles"; 
const TILESET_PATH = "assets/images/floors.png";

/**
 * Preload: Carica lo spritesheet
 */
function godot_preload(s) {
    s.load.spritesheet(TILESET_KEY, TILESET_PATH, { 
        frameWidth: DIMENSIONE_TILE, 
        frameHeight: DIMENSIONE_TILE 
    });
}

/**
 * Create: Genera la mappa usando Greedy Meshing per la fisica
 */
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
            
           /*  if (id === PUNTO_SPAWN_RAGNO) {
                PP.game_state.set_variable("spawn_x", posX + 16);
                PP.game_state.set_variable("spawn_y", posY);
                continue; 
            }
 */
            // -- DISEGNO GRAFICO (Semplice immagine per tutti) --
            // Non creiamo la fisica qui, solo l'immagine visiva.
            // Nota: id - 1 per il frame corretto di Phaser.
            let tile = s.add.image(posX, posY, TILESET_KEY, id - 1);
            tile.setOrigin(0, 0);
        }
    }

    // ============================================================
    // FASE 2: GREEDY MESHING (Ottimizzazione Fisica)
    // Uniamo i blocchi vicini in rettangoli giganti
    // ============================================================
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            
            // Se abbiamo già gestito questo blocco o non è solido, saltiamo
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