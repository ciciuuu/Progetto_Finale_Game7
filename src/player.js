// --- VARIABILI GLOBALI PLAYER ---
let player_speed = 300;
let player_speed2 = 600;
let jump_init_speed = 500;
let space_pressed = false;
let mid_jump = true;
let curr_anim = "stop";
let j_pressed = false;

// Variabili stato danno
let player_vulnerable = true; 
let sipario_nero_obj = null;
let is_fading_death = false;

function preload_player(s) {
    // Caricamenti se servono
}

function configure_player_animations(s, player) {
    // ... (Tutte le tue animazioni restano uguali, per brevità non le ricopio tutte) ...
    PP.assets.sprite.animation_add_list(player, "run", [0, 1, 2, 3, 4, 5, 6, 7, 8], 13, -1);
    PP.assets.sprite.animation_add_list(player, "idle", [10, 11, 12, 13, 14, 15], 8, -1);
    PP.assets.sprite.animation_add(player, "jump_up", 3, 4, 10, 0);
    PP.assets.sprite.animation_add(player, "jump_down", 6, 7, 10, 0);
    PP.assets.sprite.animation_add(player, "stop", 21, 21, 10, 0);
    PP.assets.sprite.animation_add_list(player, "sparo_inquinante", [41, 42, 43, 36, 37, 38], 8, -1);
    PP.assets.sprite.animation_add_list(player, "sparo_rinnovabile", [51, 52, 53, 46, 47, 48], 11, -1);
    PP.assets.sprite.animation_add_list(player, "sparo_inquinante_fermo", [61, 62, 63, 56, 57, 58], 8, -1);
    PP.assets.sprite.animation_add_list(player, "sparo_rinnovabile_fermo", [71, 72, 73, 66, 67, 68], 11, -1);
    PP.assets.sprite.animation_add_list(player, "sparo_inquinante_salto_su", [16, 17, 18], 8, 0);
    PP.assets.sprite.animation_add_list(player, "sparo_rinnovabile_salto_su", [26, 27, 28], 11, 0);
    PP.assets.sprite.animation_add_list(player, "sparo_inquinante_salto_giu", [21, 22, 23], 8, 0);
    PP.assets.sprite.animation_add_list(player, "sparo_rinnovabile_salto_giu", [31, 32, 33], 11, 0);

    PP.physics.set_collision_rectangle(player, 20, 44, -10, 30);
    player.ph_obj.body.setOffset(14, 8);

    player.sparo_attivo = false;
    player.coyote_counter = 0;
    player.is_frozen = false;
    player.last_fired = 0;
    player.modalita_inquinante = false; 
    player.tasto_R_rilasciato = true;   
    player.fire_rate = 750;     
    player.anim_sparo_corrente = "sparo_rinnovabile";
    player.god_mode = false;
    player.is_dead = false; 
    
    // Reset variabili sicuro al 100%
    player_vulnerable = true;
    if(player.ph_obj) {
        player.ph_obj.clearTint();
        player.ph_obj.alpha = 1;
    }

    sipario_nero_obj = null;
    is_fading_death = false;
}

// ------------------------------------------------------------------
// --- FUNZIONE CENTRALE DANNO (Robustezza e Lampeggio Migliorati) ---
// ------------------------------------------------------------------
function damage_player(s, player) {
    // 1. Controlli Preliminari
    if (!player_vulnerable || player.is_dead || player.god_mode) return;

    // 2. Attiva Invulnerabilità Logica
    player_vulnerable = false;

    // 3. Calcolo HP
    let hp_attuali = PP.game_state.get_variable("HP_player");
    let hp_rimanenti = hp_attuali - 1;
    PP.game_state.set_variable("HP_player", hp_rimanenti);

    console.log("Colpito! HP rimasti: " + hp_rimanenti);

    // 4. Feedback Visivo IMMEDIATO: Diventa ROSSO
    if (player.ph_obj) {
        player.ph_obj.setTint(0xff523b );
    }

    // 5. Controllo Morte
    if (hp_rimanenti <= 0) {
        morte_player(s, player);
        return; // Interrompe tutto il resto se muore
    }

    // 6. TIMER CONFIGURABILI
    let tempo_rosso = 200;          // Durata del rosso (ms)
    let tempo_totale_inv = 1500;    // Durata totale invulnerabilità (ms) -> MODIFICA QUI
    let velocita_blink = 150;        // Velocità lampeggio (ms) -> Più basso = più veloce

    // qui si rimuove il rosso dato dal danno
    PP.timers.add_timer(s, tempo_rosso, function () {
        if (player && player.ph_obj && !player.is_dead) {
            player.ph_obj.clearTint(); 
        }
    }, false);

    // lampeggi invulnerabilità
    let tempo_disponibile_blink = tempo_totale_inv - tempo_rosso;
    let numero_tick = Math.floor(tempo_disponibile_blink / velocita_blink);

    for(let i = 0; i < numero_tick; i++) {
        let momento_esatto = tempo_rosso + (i * velocita_blink);

        PP.timers.add_timer(s, momento_esatto, function () {
            if (player && player.ph_obj && !player.is_dead) {
                // Se alpha è 1 diventa 0.2, se è diverso da 1 torna a 1
                // Usiamo 0.2 per renderlo molto trasparente
                player.ph_obj.alpha = (player.ph_obj.alpha === 1) ? 0.2 : 1;
            }
        }, false);
    }

    // timer che scatta alla fine e rimette tutto a posto
    PP.timers.add_timer(s, tempo_totale_inv, function () {
        if (player && player.ph_obj) {
            player_vulnerable = true; // Sblocca la possibilità di essere colpiti
            player.ph_obj.alpha = 1;  // Assicura visibilità totale
            player.ph_obj.clearTint();// Sicurezza extra
        }
    }, false);
}

function morte_player(s, player) {
    if (player.is_dead) return; 
    player.is_dead = true;
    console.log("MORTE DEL PLAYER AVVIATA");

    if (player && player.ph_obj.active) {
        player.ph_obj.setTint(0xFF0000); 
        player.ph_obj.body.enable = false; 
        player.ph_obj.body.setVelocity(0, 0); 
    }

    // Fade nero manuale
    sipario_nero_obj = PP.shapes.rectangle_add(s, 
        PP.game.config.canvas_width/2, 
        PP.game.config.canvas_height/2, 
        PP.game.config.canvas_width, 
        PP.game.config.canvas_height, 
        "0x000000", 
        0
    );
    sipario_nero_obj.ph_obj.setScrollFactor(0);
    sipario_nero_obj.ph_obj.setDepth(9999);
    is_fading_death = true;
}

function manage_player_update(s, player, muri_livello) {
    
    // Gestione Fade Morte
    if (is_fading_death && sipario_nero_obj) {
        if (sipario_nero_obj.ph_obj.alpha < 1) {
            sipario_nero_obj.ph_obj.alpha += 0.02; 
        } else {
            is_fading_death = false;
            PP.scenes.start("game_over");
            return;
        }
    }

    // Blocco Congelamento
    if (player.is_frozen) {
        PP.physics.set_velocity_x(player, 0);
        if (player.ph_obj.anims.currentAnim && player.ph_obj.anims.currentAnim.key !== "idle") {
            PP.assets.sprite.animation_play(player, "idle");
        }
        return; 
    }
    
    if (player.is_dead) return;

    let next_anim = curr_anim;

    // --- HUD SYNC ---
    if (typeof hud_modalita_inquinante !== 'undefined') {
        if (player.modalita_inquinante !== hud_modalita_inquinante) {
            player.modalita_inquinante = hud_modalita_inquinante;
            if (player.modalita_inquinante) {
                player.fire_rate = 545; 
                player.anim_sparo_corrente = "sparo_inquinante";
            } else {
                player.fire_rate = 750; 
                player.anim_sparo_corrente = "sparo_rinnovabile";
            }
        }
    }

    // --- SPARO ---
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.N)) {
        player.sparo_attivo = true;
        if(typeof gestisci_sparo === "function") gestisci_sparo(s, player, muri_livello);
    } else {
        player.sparo_attivo = false;
    }

    // --- MOVIMENTO ---
    let is_moving = false;
    let target_velocity_x = 0;

    if (PP.interactive.kb.is_key_down(s, PP.key_codes.D)) {
        target_velocity_x = player_speed;
        player.geometry.flip_x = false;
        player.ph_obj.body.setOffset(14, 8);
        is_moving = true;
    }
    else if (PP.interactive.kb.is_key_down(s, PP.key_codes.A)) {
        target_velocity_x = -player_speed;
        player.geometry.flip_x = true;
        player.ph_obj.body.setOffset(20, 8);
        is_moving = true;
    }
    else if (PP.interactive.kb.is_key_down(s, PP.key_codes.C)) {
        target_velocity_x = player_speed2;
        player.geometry.flip_x = false;
        player.ph_obj.body.setOffset(14, 8);
        is_moving = true;
    }
    else if (PP.interactive.kb.is_key_down(s, PP.key_codes.Z)) {
        target_velocity_x = -player_speed2;
        player.geometry.flip_x = true;
        player.ph_obj.body.setOffset(20, 8);
        is_moving = true;
    }

    if (player.sparo_attivo && is_moving) {
        let direzione = player.geometry.flip_x ? -1 : 1;
        target_velocity_x = 150 * direzione;
    }

    PP.physics.set_velocity_x(player, target_velocity_x);

    // 4. LOGICA DI SALTO E COYOTE TIME (VARIABLE JUMP)

    let is_on_solid_ground = player.ph_obj.body.blocked.down;

    if (is_on_solid_ground) {
        player.coyote_counter = 10;
        mid_jump = true; 
    } else {
        if (player.coyote_counter > 0) player.coyote_counter--;
    }

    // Salto Iniziale
    if (player.coyote_counter > 0) {
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false) {
            space_pressed = true;
            PP.physics.set_velocity_y(player, -jump_init_speed);
            player.coyote_counter = 0;
        }
    }

    // Doppio Salto
    if (!is_on_solid_ground) {
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false && mid_jump == true) {
            space_pressed = true;
            PP.physics.set_velocity_y(player, -jump_init_speed);
            mid_jump = false;
        }
    }

    // VARIABLE JUMP HEIGHT (Rilascio tasto = freno salita)
    if (PP.interactive.kb.is_key_up(s, PP.key_codes.SPACE)) {
        if (space_pressed) {
            let current_vy = PP.physics.get_velocity_y(player);
            // Se sta andando su (velocità negativa), riduciamo del 50%
            if (current_vy < -50) {
                PP.physics.set_velocity_y(player, current_vy * 0.5);
            }
            space_pressed = false;
        }
    }

    // --- ANIMAZIONI ---
    let anim_sparo_corsa = player.anim_sparo_corrente; 
    let anim_sparo_fermo = player.modalita_inquinante ? "sparo_inquinante_fermo" : "sparo_rinnovabile_fermo";
    let anim_sparo_salto_su = player.modalita_inquinante ? "sparo_inquinante_salto_su" : "sparo_rinnovabile_salto_su";
    let anim_sparo_salto_giu = player.modalita_inquinante ? "sparo_inquinante_salto_giu" : "sparo_rinnovabile_salto_giu";

    if (!is_on_solid_ground) {
        let v_y = PP.physics.get_velocity_y(player);
        if (player.sparo_attivo) {
            next_anim = (v_y < 0) ? anim_sparo_salto_su : anim_sparo_salto_giu;
        } else {
            if (v_y < 0) next_anim = "jump_up";
            else if (v_y > 0) next_anim = "jump_down";
        }
    } else {
        if (player.sparo_attivo) {
            next_anim = is_moving ? anim_sparo_corsa : anim_sparo_fermo;
        } else {
            next_anim = is_moving ? "run" : "idle";
        }
    }

    if (next_anim != curr_anim) {
        PP.assets.sprite.animation_play(player, next_anim);
        curr_anim = next_anim;
    }

    // --- GOD MODE ---
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.J)) {
        if (j_pressed == false) {
            player.god_mode = !player.god_mode;
            j_pressed = true;
            if (player.god_mode) {
                console.log("GOD MODE: ON");
                player.ph_obj.body.allowGravity = false;
                PP.physics.set_velocity_y(player, 0);
                player.ph_obj.setTint(0xFFFF00);
            } else {
                console.log("GOD MODE: OFF");
                player.ph_obj.body.allowGravity = true;
                player.ph_obj.clearTint();
            }
        }
    } else {
        j_pressed = false;
    }

    if (player.god_mode) {
        let speed_fly = 700;
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.D)) PP.physics.set_velocity_x(player, speed_fly);
        else if (PP.interactive.kb.is_key_down(s, PP.key_codes.A)) PP.physics.set_velocity_x(player, -speed_fly);
        else PP.physics.set_velocity_x(player, 0);

        if (PP.interactive.kb.is_key_down(s, PP.key_codes.W) || PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) PP.physics.set_velocity_y(player, -speed_fly);
        else if (PP.interactive.kb.is_key_down(s, PP.key_codes.S)) PP.physics.set_velocity_y(player, speed_fly);
        else PP.physics.set_velocity_y(player, 0);
    }


    // DEBUG
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.P)) {
        let coord_x = Math.round(player.ph_obj.x);
        let coord_y = Math.round(player.ph_obj.y);
        console.log(`POS: ${coord_x}, ${coord_y}`);
    }
    
}