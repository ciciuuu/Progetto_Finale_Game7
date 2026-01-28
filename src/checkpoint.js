let img_checkpoint_flag;

function preload_checkpoint(s) {
    // Caricamento spritesheet 39x73
    img_checkpoint_flag = PP.assets.sprite.load_spritesheet(s, "assets/images/MAPPA/checkpoint.png", 39, 73);
}

function crea_bandierina_checkpoint(s, x, y, gia_preso) {
    // Creazione Sprite (alzato di 36px per il pivot)
    let flag = PP.assets.sprite.add(s, img_checkpoint_flag, x, y - 36, 0.5, 0.5);
    
    PP.physics.add(s, flag, PP.physics.type.STATIC);

    // --- ANIMAZIONI ---
    PP.assets.sprite.animation_add_list(flag, "rossa", [0], 1, 0);
    PP.assets.sprite.animation_add_list(flag, "attivazione", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, 0);
    PP.assets.sprite.animation_add_list(flag, "verde", [9], 1, 0);

    // Stato Iniziale
    if (gia_preso) {
        PP.assets.sprite.animation_play(flag, "verde");
    } else {
        PP.assets.sprite.animation_play(flag, "rossa");
    }

    return flag;
}

function controlla_attivazione_checkpoint(s, player, flag_obj, x_trigger, stato_attuale) {
    // Se è già preso, non facciamo nulla
    if (stato_attuale) return false;

    // Controllo se il player supera la X specifica
    if (player.ph_obj.x >= x_trigger) {
        
        console.log("CHECKPOINT RAGGIUNTO!");

        // 1. Parte l'animazione
        PP.assets.sprite.animation_play(flag_obj, "attivazione");
        
        // Quando finisce l'animazione di attivazione, passa a verde fisso
        flag_obj.ph_obj.on('animationcomplete', function (anim) {
            if (anim.key === 'attivazione') {
                PP.assets.sprite.animation_play(flag_obj, "verde");
            }
        }, s);

        // 2. Salvataggio Dati
        salva_dati_checkpoint(s, player);
        
        // Ritorna TRUE per aggiornare la variabile nel file del livello
        return true;
    }
    
    return false;
}

function salva_dati_checkpoint(s, player) {
    // [MODIFICA] Salviamo la Y un po' più in alto (1 blocco = 32px)
    // Così il player respawna a metà altezza bandierina e non nel terreno.
    let safe_y = player.ph_obj.y - 32;

    PP.game_state.set_variable("cp_x", player.ph_obj.x);
    PP.game_state.set_variable("cp_y", safe_y);
    
    // Aggiorniamo anche spawn per compatibilità
    PP.game_state.set_variable("spawn_x", player.ph_obj.x);
    PP.game_state.set_variable("spawn_y", safe_y);
    
    let hp_now = PP.game_state.get_variable("HP_player");
    PP.game_state.set_variable("HP_checkpoint", hp_now);

    // Salva collezionabili
    if (typeof window.salva_collezionabili_al_checkpoint === "function") {
        window.salva_collezionabili_al_checkpoint();
    }

    PP.game_state.set_variable("checkpoint_attivo", true);
    
    // Identifichiamo il livello corrente per il game over
    let current_scene = s.scene.key; 
    PP.game_state.set_variable("ultimo_livello", current_scene);
}

// Esportiamo le funzioni globalmente
window.preload_checkpoint = preload_checkpoint;
window.crea_bandierina_checkpoint = crea_bandierina_checkpoint;
window.controlla_attivazione_checkpoint = controlla_attivazione_checkpoint;