let player_speed = 300;
let player_speed2 = 600;

let jump_init_speed = 500;

let space_pressed = false;
let mid_jump = true;

let curr_anim = "stop";

let j_pressed = false;

function preload_player(s) {

}

function configure_player_animations(s, player) {
    // Configurazione animazioni
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

    // HITBOX 
    PP.physics.set_collision_rectangle(player, 20, 44, -10, 30);
    player.ph_obj.body.setOffset(14, 8);

    // --- VARIABILI DI STATO ---
    player.sparo_attivo = false;
    player.coyote_counter = 0;
    player.is_frozen = false;

    // --- VARIABILI PER LO SPARO ---
    player.last_fired = 0;

    // --- GESTIONE CAMBIO ARMA ---
    player.modalita_inquinante = false; // False = Normale, True = Veloce/Inquinante
    player.tasto_R_rilasciato = true;   // Serve per evitare che il cambio avvenga 60 volte al secondo

    // Impostiamo i valori iniziali
    player.fire_rate = 750;     // Lento
    player.anim_sparo_corrente = "sparo_rinnovabile";

    // GOD MODE (VOLO)
    player.god_mode = false;
}

function manage_player_update(s, player, muri_livello) {
    
    if (player.is_frozen) {
        PP.physics.set_velocity_x(player, 0);
        if (player.ph_obj.anims.currentAnim && player.ph_obj.anims.currentAnim.key !== "idle") {
            PP.assets.sprite.animation_play(player, "idle");
        }
        return; 
    }

    let next_anim = curr_anim;


    // 1. SINCRONIZZAZIONE ARMA CON HUD
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

    // 2. GESTIONE SPARO
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.N)) {
        player.sparo_attivo = true;
        gestisci_sparo(s, player, muri_livello);
    } else {
        player.sparo_attivo = false;
    }


    // 3. GESTIONE MOVIMENTO
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
        let direzione;
        if (player.geometry.flip_x == true) {
            direzione = -1;
        } else {
            direzione = 1;
        }
        target_velocity_x = 150 * direzione;
    }

    PP.physics.set_velocity_x(player, target_velocity_x);


    // 4. LOGICA DI SALTO E COYOTE TIME (MODIFICATA)

    let is_on_solid_ground = player.ph_obj.body.blocked.down;

    // Gestione Coyote Time
    if (is_on_solid_ground) {
        player.coyote_counter = 10;
        mid_jump = true; // Resetta il doppio salto quando tocchi terra
    } else {
        if (player.coyote_counter > 0) {
            player.coyote_counter--;
        }
    }

    // --- SALTO INIZIALE (DA TERRA) ---
    if (player.coyote_counter > 0) {
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false) {
            space_pressed = true;
            PP.physics.set_velocity_y(player, -jump_init_speed);
            player.coyote_counter = 0;
        }
    }

    // --- DOPPIO SALTO ---
    if (!is_on_solid_ground) {
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false && mid_jump == true) {
            space_pressed = true;
            PP.physics.set_velocity_y(player, -jump_init_speed);
            mid_jump = false;
        }
    }

    // --- SALTO VARIABILE (TAGLIO VELOCITÀ AL RILASCIO) ---
    if (PP.interactive.kb.is_key_up(s, PP.key_codes.SPACE)) {
        // Se stavamo premendo spazio (space_pressed true) e ora lo abbiamo rilasciato...
        if (space_pressed) {
            let current_vy = PP.physics.get_velocity_y(player);
            
            // Se il player sta andando verso l'alto (velocità negativa)
            // -50 è una soglia di sicurezza per non tagliare se siamo già quasi all'apice
            if (current_vy < -50) {
                // Riduciamo la velocità verticale del 50%
                PP.physics.set_velocity_y(player, current_vy * 0.5);
            }
            
            // Resettiamo il flag
            space_pressed = false;
        }
    }


    // 5. GESTIONE ANIMAZIONI

    let anim_sparo_corsa = player.anim_sparo_corrente; 
    let anim_sparo_fermo;
    let anim_sparo_salto_su; 
    let anim_sparo_salto_giu; 

    if (player.modalita_inquinante == true) {
        anim_sparo_fermo = "sparo_inquinante_fermo";
        anim_sparo_salto_su = "sparo_inquinante_salto_su";
        anim_sparo_salto_giu = "sparo_inquinante_salto_giu";
    } else {
        anim_sparo_fermo = "sparo_rinnovabile_fermo";
        anim_sparo_salto_su = "sparo_rinnovabile_salto_su";
        anim_sparo_salto_giu = "sparo_rinnovabile_salto_giu";
    }

    if (!is_on_solid_ground) {
        // --- IN ARIA ---
        let v_y = PP.physics.get_velocity_y(player);

        if (player.sparo_attivo) {
            if (v_y < 0) {
                next_anim = anim_sparo_salto_su;  
            } else {
                next_anim = anim_sparo_salto_giu; 
            }
        } else {
            if (v_y < 0) {
                next_anim = "jump_up";
            } else if (v_y > 0) {
                next_anim = "jump_down";
            }
        }
        // Nota: Il blocco del doppio salto qui era ridondante, l'ho spostato sopra nella sezione logica salto

    } else {
        // --- A TERRA ---
        if (player.sparo_attivo) {
            if (is_moving) {
                next_anim = anim_sparo_corsa; 
            } else {
                next_anim = anim_sparo_fermo;  
            }
        } else {
            if (is_moving) {
                next_anim = "run";
            } else {
                next_anim = "idle";
            }
        }
    }

    if (next_anim != curr_anim) {
        PP.assets.sprite.animation_play(player, next_anim);
        curr_anim = next_anim;
    }

    // GOD MODE (Tasto J)
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.J)) {
        if (j_pressed == false) {
            player.god_mode = !player.god_mode;
            j_pressed = true;

            if (player.god_mode == true) {
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

    if (player.god_mode == true) {
        let speed_fly = 700;
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.D)) {
            PP.physics.set_velocity_x(player, speed_fly);
        } else if (PP.interactive.kb.is_key_down(s, PP.key_codes.A)) {
            PP.physics.set_velocity_x(player, -speed_fly);
        } else {
            PP.physics.set_velocity_x(player, 0);
        }

        if (PP.interactive.kb.is_key_down(s, PP.key_codes.W) || PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
            PP.physics.set_velocity_y(player, -speed_fly);
        } else if (PP.interactive.kb.is_key_down(s, PP.key_codes.S)) {
            PP.physics.set_velocity_y(player, speed_fly);
        } else {
            PP.physics.set_velocity_y(player, 0);
        }
        return;
    }
}