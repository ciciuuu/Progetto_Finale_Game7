let img_checkpoint_flag;

// Vita minima quando si rinasce al checkpoint
// se muori con meno di 5 HP, rinasci con 5. Se ne avevi di più, te li tieni
const MIN_HP_RESPAWN = 5; 

function preload_checkpoint(s) {
    img_checkpoint_flag = PP.assets.sprite.load_spritesheet(s, "assets/images/MAPPA/Checkpoint.png", 39, 73)
}

function crea_bandierina_checkpoint(s, x, y, gia_preso) {
    let flag = PP.assets.sprite.add(s, img_checkpoint_flag, x, y - 36, 0.5, 0.5)
    
    PP.physics.add(s, flag, PP.physics.type.STATIC)

    PP.assets.sprite.animation_add_list(flag, "rossa", [0], 1, 0) // Spenta
    PP.assets.sprite.animation_add_list(flag, "attivazione", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, 0) // Transizione
    PP.assets.sprite.animation_add_list(flag, "verde", [9], 1, 0) // Attiva

    // Se ricarico il livello e avevo già preso questo checkpoint, lo mostro subito verde
    if (gia_preso) {
        PP.assets.sprite.animation_play(flag, "verde")
    } else {
        PP.assets.sprite.animation_play(flag, "rossa")
    }

    return flag
}

function controlla_attivazione_checkpoint(s, player, flag_obj, x_trigger, stato_attuale) {
    // Se è già attivo, non devo fare nulla
    if (stato_attuale) return false

    // Controllo se il player ha superato la coordinata X della bandierina
    if (player.geometry.x >= x_trigger) {
        console.log("CHECKPOINT RAGGIUNTO")

        // Faccio partire l'animazione che alza la bandiera
        PP.assets.sprite.animation_play(flag_obj, "attivazione")
        
        // [PHASER] Gestione evento 'animationcomplete'
        // Uso Phaser nativo per sapere esattamente quando l'animazione finisce
        // Appena finisce l'alzata, faccio partire il loop verde statico
        flag_obj.ph_obj.on('animationcomplete', function (anim) {
            if (anim.key === 'attivazione') {
                PP.assets.sprite.animation_play(flag_obj, "verde")
            }
        }, s)

        // Eseguo il salvataggio dei dati
        salva_dati_checkpoint(s, player)
        
        // Ritorno true per dire al livello di aggiornare la variabile 'checkpoint_preso'
        return true
    }
    
    return false
}

function salva_dati_checkpoint(s, player) {
    // 1. Coordinate di Respawn
    // Salvo la Y un po' più in alto (-32) per evitare che il player si incastri nel pavimento rinascendo
    let safe_y = player.geometry.y - 32
    
    // Salvo nelle variabili CP (dedicate al checkpoint)
    PP.game_state.set_variable("cp_x", player.geometry.x)
    PP.game_state.set_variable("cp_y", safe_y)
    
    PP.game_state.set_variable("spawn_x", player.geometry.x)
    PP.game_state.set_variable("spawn_y", safe_y)
    
    // 2. LOGICA CURA AL RESPAWN
    // Recupero la vita che ha il player adesso
    let vita_attuale = Number(PP.game_state.get_variable("HP_player"))
    if (isNaN(vita_attuale)) vita_attuale = 1 // Sicurezza se il dato è corrotto

    // Calcolo quanta vita avrà quando rinascerà
    // Math.max restituisce il numero più grande tra i due
    // Es: Ho 2 hp -> max(2, 5) = 5 (Ti curo)
    // Es: Ho 9 hp -> max(9, 5) = 9 (Ti tengo la vita alta)
    let vita_futura = Math.max(vita_attuale, MIN_HP_RESPAWN)

    console.log("Salvataggio Checkpoint - Vita attuale: " + vita_attuale + " | Vita al respawn: " + vita_futura)

    // Salvo il valore in "HP_checkpoint" (futuro), NON tocco "HP_player"
    PP.game_state.set_variable("HP_checkpoint", vita_futura)



    // 3. Salvataggio Collezionabili e Stato
    if (typeof window.salva_collezionabili_al_checkpoint === "function") {
        window.salva_collezionabili_al_checkpoint()
    }

    // Segno che c'è un checkpoint attivo e mi ricordo in che livello sono
    PP.game_state.set_variable("checkpoint_attivo", true)
    PP.game_state.set_variable("ultimo_livello", s.scene.key)
}

// Esporto le funzioni per renderle utilizzabili nei file dei livelli (es. base.js)
window.preload_checkpoint = preload_checkpoint
window.crea_bandierina_checkpoint = crea_bandierina_checkpoint
window.controlla_attivazione_checkpoint = controlla_attivazione_checkpoint