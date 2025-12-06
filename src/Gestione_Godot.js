// CONFIGURAZIONE LIVELLO
const DIMENSIONE_TILE = 32; 
const PUNTO_SPAWN = 30; 
const BLOCCHI_SOLIDI = [42, 43, 44, 52, 54]; 
const TILESET_KEY = "tiles"; 
const TILESET_PATH = "assets/images/DESERTO.png";

/**
 * Funzione di Preload
 * Carica la grafica necessaria per costruire il livello.
 * Deve essere chiamata dentro preload() di base.js
 */
function godot_preload(s) {
    s.load.spritesheet(TILESET_KEY, TILESET_PATH, { 
        frameWidth: DIMENSIONE_TILE, 
        frameHeight: DIMENSIONE_TILE 
    });
}

/**
 * Funzione di Creazione Livello
 * Legge la matrice di Godot, piazza i blocchi e imposta i limiti del mondo.
 * Deve essere chiamata dentro create() di base.js
 * * @returns {object} Il gruppo fisico dei muri (da usare per le collisioni)
 */
function godot_create(s) {
    
    // Verifica sicurezza dati
    if (typeof MATRICE === 'undefined' || typeof OFFSET_X === 'undefined' || typeof OFFSET_Y === 'undefined') {
        console.error("ERRORE CRITICO: Variabili del livello (MATRICE, OFFSET_X, OFFSET_Y) non trovate. Hai incluso il file livello_dati.js nell'HTML prima di questo script?");
        return null;
    }

    // 1. Creiamo il gruppo fisico statico per i muri
    // Usiamo la fisica nativa di Phaser per massimizzare le prestazioni con tanti blocchi
    let gruppoMuri = s.physics.add.staticGroup(); 

    // 2. Calcolo Dimensioni e Bordi del Mondo
    let world_cols = MATRICE[0].length;
    let world_rows = MATRICE.length;
    
    let larghezzaMondo = world_cols * DIMENSIONE_TILE;
    let altezzaMondo = world_rows * DIMENSIONE_TILE;

    // Calcolo coordinate reali di inizio (possono essere negative se OFFSET_X < 0)
    let start_x_pixel = OFFSET_X * DIMENSIONE_TILE;
    let start_y_pixel = OFFSET_Y * DIMENSIONE_TILE;

    // Impostiamo i confini per Fisica e Camera
    s.physics.world.setBounds(start_x_pixel, start_y_pixel, larghezzaMondo, altezzaMondo);
    s.cameras.main.setBounds(start_x_pixel, start_y_pixel, larghezzaMondo, altezzaMondo);
    
    // 3. Ciclo di generazione della mappa
    for (let y = 0; y < world_rows; y++) {
        for (let x = 0; x < world_cols; x++) {

            let id = MATRICE[y][x]; 
            
            // Se l'ID è 0 (vuoto), passiamo oltre
            if (id === 0) continue; 

            // Calcolo posizione in pixel del blocco corrente
            let posX = (x + OFFSET_X) * DIMENSIONE_TILE;
            let posY = (y + OFFSET_Y) * DIMENSIONE_TILE;

            // --- GESTIONE SPAWN PLAYER ---
            if (id === PUNTO_SPAWN) {
                // Salviamo le coordinate nello stato globale di PoliPhaser
                // Aggiungiamo metà dimensione (+16) alla X per centrare lo sprite
                // Togliamo metà dimensione (-16) alla Y perché in Godot l'origine è spesso in basso a sinistra
                PP.game_state.set_variable("spawn_x", posX + 16);
                PP.game_state.set_variable("spawn_y", posY);
                continue; // Non disegniamo nulla in questo punto
            }

            // Nota: Godot usa ID che partono da 1, Phaser da 0. Quindi frame = id - 1
            let frame_id = id - 1;

            // --- GESTIONE MURI SOLIDI ---
            if (BLOCCHI_SOLIDI.includes(id)) {
                let muro = gruppoMuri.create(posX, posY, TILESET_KEY, frame_id);
                muro.setOrigin(0, 0); // Allineamento in alto a sinistra
                muro.refreshBody();   // Calcola la hitbox statica
            } 
            // --- GESTIONE DECORAZIONI ---
            else {
                let decorazione = s.add.image(posX, posY, TILESET_KEY, frame_id);
                decorazione.setOrigin(0, 0);
            }
        }
    }

    // Aggiornamento finale del gruppo
    gruppoMuri.refresh();
    
    console.log("Livello Godot generato con successo.");

    // Restituiamo il gruppo muri a base.js per collegarlo al player
    return gruppoMuri;
}

// Esponiamo le funzioni globalmente per renderle visibili a base.js (che è un modulo)
window.godot_preload = godot_preload;
window.godot_create = godot_create;