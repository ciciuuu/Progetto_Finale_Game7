// zone_segrete.js

let img_zona_segreta_asset;
let lista_zone_segrete_attive = [];

function preload_zone_segrete(s) {
    img_zona_segreta_asset = PP.assets.image.load(s, "assets/images/MAPPA/Zona segreta.png");
}

/**
 * Crea le zone segrete con trigger fisico.
 * @param {object} s - La scena
 * @param {object} player - Il player (serve per la collisione)
 * @param {Array} config_zone - Lista configurazione
 */
function create_zone_segrete(s, player, config_zone) {
    lista_zone_segrete_attive = [];

    if (!config_zone || config_zone.length === 0) return;

    // Layer dedicato
    let layer_segreti = PP.layers.create(s);
    PP.layers.set_z_index(layer_segreti, 500);

    let is_debug = PP.game_state.get_variable("debug_mode");

    for (let i = 0; i < config_zone.length; i++) {
        let dati = config_zone[i];

        // 1. Immagine di Copertura (Visuale)
        // Posizionata in base alle coordinate fornite (Top-Left)
        let zona_obj = PP.assets.image.add(s, img_zona_segreta_asset, dati.img_x, dati.img_y, 0, 0);
        PP.layers.add_to_layer(layer_segreti, zona_obj);

        // 2. Trigger Fisico (Shape Rettangolo)
        // Calcoliamo il centro perché PP.shapes posiziona dal centro
        let centerX = dati.trigger_x + (dati.trigger_w / 2);
        let centerY = dati.trigger_y + (dati.trigger_h / 2);

        // Se debug è attivo, lo facciamo rosso semitrasparente, altrimenti invisibile
        let alpha_trigger = is_debug ? 0.5 : 0;
        let trigger_shape = PP.shapes.rectangle_add(s, centerX, centerY, dati.trigger_w, dati.trigger_h, "0xFF0000", alpha_trigger);
        
        // Aggiungiamo fisica statica (sensore)
        PP.physics.add(s, trigger_shape, PP.physics.type.STATIC);
        
        // Se debug attivo, aggiungiamo al layer per vederlo muoversi con la camera
        if (is_debug) {
            PP.layers.add_to_layer(layer_segreti, trigger_shape);
        } else {
            // Se invisibile, lo fissiamo comunque allo scroll del mondo (default)
            // o lo aggiungiamo al layer per coerenza
            PP.layers.add_to_layer(layer_segreti, trigger_shape);
        }

        // Oggetto di stato per questa zona
        let zona_state = {
            obj: zona_obj,
            trigger: trigger_shape,
            is_overlapping: false // Flag resettato ogni frame
        };

        // 3. Callback di Sovrapposizione PoliPhaser
        // Ogni frame che il player tocca il rettangolo, questa funzione viene eseguita
        PP.physics.add_overlap_f(s, player, trigger_shape, function() {
            zona_state.is_overlapping = true;
        });

        lista_zone_segrete_attive.push(zona_state);
    }
}

function update_zone_segrete(s) {
    for (let i = 0; i < lista_zone_segrete_attive.length; i++) {
        let zona = lista_zone_segrete_attive[i];
        
        if (zona.is_overlapping) {
            // PLAYER DENTRO: Fade Out (Rivela)
            if (zona.obj.visibility.alpha > 0) {
                zona.obj.visibility.alpha -= 0.1;
                if(zona.obj.visibility.alpha < 0) zona.obj.visibility.alpha = 0;
            }
        } else {
            // PLAYER FUORI: Fade In (Copri)
            if (zona.obj.visibility.alpha < 1) {
                zona.obj.visibility.alpha += 0.1;
                if(zona.obj.visibility.alpha > 1) zona.obj.visibility.alpha = 1;
            }
        }

        // RESET DEL FLAG
        // Fondamentale: assumiamo che il player sia uscito. 
        // Se nel prossimo physics step è ancora dentro, l'overlap lo rimetterà a true.
        zona.is_overlapping = false;
    }
}