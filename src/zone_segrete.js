let lista_zone_segrete_attive = []

function preload_zone_segrete(s) {
}

function create_zone_segrete(s, player, config_zone) {
    lista_zone_segrete_attive = []

    if (!config_zone || config_zone.length === 0) return

    let layer_segreti = PP.layers.create(s)
    PP.layers.set_z_index(layer_segreti, 500)

    let is_debug = PP.game_state.get_variable("debug_mode")

    for (let i = 0; i < config_zone.length; i++) {
        let dati = config_zone[i]

        /* if (!dati.asset) {
            console.error("ERRORE: Asset immagine mancante per la zona segreta alle coordinate " + dati.img_x)
            continue
        } */

        // 1. IMMAGINE DI COPERTURA
        let zona_obj = PP.assets.image.add(s, dati.asset, dati.img_x, dati.img_y, 0, 0)
        PP.layers.add_to_layer(layer_segreti, zona_obj)

        // 2. TRIGGER FISICO (Area invisibile)
        let centerX = dati.trigger_x + (dati.trigger_w / 2)
        let centerY = dati.trigger_y + (dati.trigger_h / 2)

        // Se debug è attivo lo vedo rosso, altrimenti è invisibile (alpha 0)
        let alpha_trigger = is_debug ? 0.5 : 0
        let trigger_shape = PP.shapes.rectangle_add(s, centerX, centerY, dati.trigger_w, dati.trigger_h, "0xFF0000", alpha_trigger)
        
        // Aggiungo la fisica statica (sensore che non si muove)
        PP.physics.add(s, trigger_shape, PP.physics.type.STATIC)
        PP.layers.add_to_layer(layer_segreti, trigger_shape)

        // Creo un oggetto di stato per gestire questa specifica zona
        let zona_state = {
            obj: zona_obj,          // L'immagine da sfumare
            trigger: trigger_shape, // L'area da toccare
            is_overlapping: false   // Flag che mi dice "il player è dentro ora?"
        }

        // 3. RILEVAMENTO COLLISIONE
        PP.physics.add_overlap_f(s, player, trigger_shape, function() {
            zona_state.is_overlapping = true
        })

        lista_zone_segrete_attive.push(zona_state)
    }
}

function update_zone_segrete(s) {
    for (let i = 0; i < lista_zone_segrete_attive.length; i++) {
        let zona = lista_zone_segrete_attive[i]
        
        // Gestione della trasparenza (Fade In / Fade Out)
        if (zona.is_overlapping) {
            // PLAYER DENTRO: L'immagine deve sparire gradualmente (diventa trasparente)
            if (zona.obj.visibility.alpha > 0) {
                zona.obj.visibility.alpha -= 0.1 // Velocità dissolvenza
                if(zona.obj.visibility.alpha < 0) zona.obj.visibility.alpha = 0
            }
        } else {
            // PLAYER FUORI: L'immagine deve ricomparire (diventa opaca)
            if (zona.obj.visibility.alpha < 1) {
                zona.obj.visibility.alpha += 0.1
                if(zona.obj.visibility.alpha > 1) zona.obj.visibility.alpha = 1
            }
        }
        
        zona.is_overlapping = false
    }
}