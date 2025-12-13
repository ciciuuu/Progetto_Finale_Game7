// --- CONFIGURAZIONE GLOBALE ---
const LAYER_COUNT = 8;
const PARALLAX_ASSET_PATHS = [
    "assets/images/parallax/parallasse_1.png", // Asset 0: Per i layer più vicini (1, 2, 3)
    "assets/images/parallax/parallasse_2.png", // Asset 1: Per i layer intermedi (4, 5, 6)
    "assets/images/parallax/parallasse_3.png"  // Asset 2: Per i layer più lontani (7, 8)
];

// Mappatura degli 8 layer concettuali ai 3 asset fisici:
// [Layer 8, Layer 7, Layer 6, Layer 5, Layer 4, Layer 3, Layer 2, Layer 1]
const ASSET_INDEX_MAP = [2, 2, 1, 1, 1, 0, 0, 0]; 

// Fattori di scorrimento (dal layer 8 al layer 1):
// Layer 8 e 7 sono statici (0.0), dal layer 6 in poi aumenta la velocità
const SCROLL_FACTORS = [0.0, 0.0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5];

// --- VARIABILI DI SCENA ---
let step_length = 2;
let floor_height = 650;

// Variabili per gli asset e le istanze
let img_parallax_assets = []; // Array per i 3 asset caricati
let ts_background_layers = []; // Array per le 8 istanze di Tilesprite
let img_player;
let player;


function preload(s) {
    console.log("Executing preload() - SCENE 10");

    // 1. Caricamento ottimizzato dei 3 asset di parallasse
    for (let i = 0; i < PARALLAX_ASSET_PATHS.length; i++) {
        const path = PARALLAX_ASSET_PATHS[i];
        const loaded_img = PP.assets.image.load(s, path);
        img_parallax_assets.push(loaded_img);
    }
    
    img_player = PP.assets.image.load(s, "assets/images/player.png");

}

function create(s) {
    console.log("Executing create() - SCENE 10");

    // 2. Creazione ottimizzata degli 8 tilesprite e impostazione iniziale
    for (let i = 0; i < LAYER_COUNT; i++) {
        // i=0 è il Layer 8 (più lontano), i=7 è il Layer 1 (più vicino)
        
        // Determina quale dei 3 asset usare
        const asset_index = ASSET_INDEX_MAP[i];
        const asset = img_parallax_assets[asset_index];
        
        // Crea il tilesprite. L'ordine di creazione è corretto (dal più lontano al più vicino).
        const ts = PP.assets.tilesprite.add(s, asset, 0, 0, 1280, 800, 0, 0);
        
        // Disabilitiamo lo scroll factor standard (lo gestiamo manualmente in update)
        ts.tile_geometry.scroll_factor_x = 0;
        ts.tile_geometry.scroll_factor_y = 0;

        // Memorizziamo l'istanza con il suo fattore di scorrimento
        ts_background_layers.push({
            obj: ts,
            scroll_factor: SCROLL_FACTORS[i] 
        });
    }

    player = PP.assets.image.add(s, img_player, 640, floor_height, 0.5, 1);
    PP.camera.start_follow(s, player, 0, 250);

}

function update(s) {
    // 3. Aggiornamento ottimizzato dello scroll dei Tilesprite
    const camera_scroll_x = PP.camera.get_scroll_x(s);
    
    for (let i = 0; i < ts_background_layers.length; i++) {
        const layer = ts_background_layers[i];
        
        // Applica lo scroll solo se il fattore è maggiore di zero
        if (layer.scroll_factor > 0.0) {
            // Aggiorna la posizione del tile (non l'oggetto Tilesprite, che rimane fisso a 0, 0)
            layer.obj.tile_geometry.x = camera_scroll_x * layer.scroll_factor;
        }
    }

    // E' stato premuto il tasto freccia sinistra e il giocatore è a destra del limite sinistro del quadro?
    if(PP.interactive.kb.is_key_down(s, PP.key_codes.LEFT)) {
        player.geometry.flip_x = true;        // Volta il giocatore verso sinistra
        player.geometry.x     -= step_length; // Sposta il giocatore verso a sinistra
    }

    if(PP.interactive.kb.is_key_down(s, PP.key_codes.RIGHT)) {
        player.geometry.flip_x = false;        // Volta il giocatore verso destra
        player.geometry.x     += step_length; // Sposta il giocatore verso a destra
    }

}

function destroy(s) {
    console.log("Executing destroy() - SCENE 10");

}

PP.scenes.add("scene10", preload, create, update, destroy);