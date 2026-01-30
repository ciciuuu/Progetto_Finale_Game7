// checkpoint.js
let img_checkpoint_flag;

function preload_checkpoint(s) {
    img_checkpoint_flag = PP.assets.sprite.load_spritesheet(s, "assets/images/MAPPA/checkpoint.png", 39, 73);
}

function crea_bandierina_checkpoint(s, x, y, gia_preso) {
    let flag = PP.assets.sprite.add(s, img_checkpoint_flag, x, y - 36, 0.5, 0.5);
    PP.physics.add(s, flag, PP.physics.type.STATIC);

    PP.assets.sprite.animation_add_list(flag, "rossa", [0], 1, 0);
    PP.assets.sprite.animation_add_list(flag, "attivazione", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, 0);
    PP.assets.sprite.animation_add_list(flag, "verde", [9], 1, 0);

    if (gia_preso) {
        PP.assets.sprite.animation_play(flag, "verde");
    } else {
        PP.assets.sprite.animation_play(flag, "rossa");
    }
    return flag;
}

function controlla_attivazione_checkpoint(s, player, flag_obj, x_trigger, stato_attuale) {
    if (stato_attuale) return false;

    // Controllo posizione X
    if (player.geometry.x >= x_trigger) {
        console.log("CHECKPOINT PRESO!");

        // Animazione
        PP.assets.sprite.animation_play(flag_obj, "attivazione");
        flag_obj.ph_obj.on('animationcomplete', function (anim) {
            if (anim.key === 'attivazione') {
                PP.assets.sprite.animation_play(flag_obj, "verde");
            }
        }, s);

        // Salvataggio
        salva_dati_checkpoint(s, player);
        return true;
    }
    return false;
}

function salva_dati_checkpoint(s, player) {
    // 1. Salva coordinate (offset Y per non incastrarsi)
    let safe_y = player.geometry.y - 32;
    PP.game_state.set_variable("cp_x", player.geometry.x);
    PP.game_state.set_variable("cp_y", safe_y);
    PP.game_state.set_variable("spawn_x", player.geometry.x);
    PP.game_state.set_variable("spawn_y", safe_y);
    
    // 2. LOGICA CURA AL RESPAWN (Minimo 5 HP)
    // Prendiamo la vita attuale come numero
    let vita_attuale = Number(PP.game_state.get_variable("HP_player"));
    if (isNaN(vita_attuale)) vita_attuale = 1;

    // Calcoliamo quanto avrai QUANDO RINASCERAI.
    // Math.max restituisce il valore più alto tra i due. 
    // Se vita è 2, restituisce 5. Se vita è 8, restituisce 8.
    let vita_futura = Math.max(vita_attuale, 5);

    console.log("Salvataggio Checkpoint - Vita attuale: " + vita_attuale + " | Vita al respawn: " + vita_futura);

    // Salviamo SOLO nella variabile del checkpoint. 
    // NON tocchiamo HP_player ora, così l'HUD non cambia finché non muori.
    PP.game_state.set_variable("HP_checkpoint", vita_futura);

    // 3. Collezionabili e Stato
    if (typeof window.salva_collezionabili_al_checkpoint === "function") {
        window.salva_collezionabili_al_checkpoint();
    }
    PP.game_state.set_variable("checkpoint_attivo", true);
    PP.game_state.set_variable("ultimo_livello", s.scene.key);
}

window.preload_checkpoint = preload_checkpoint;
window.crea_bandierina_checkpoint = crea_bandierina_checkpoint;
window.controlla_attivazione_checkpoint = controlla_attivazione_checkpoint;