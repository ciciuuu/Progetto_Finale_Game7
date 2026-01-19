let player_speed = 300;
let player_speed2 = 600;

let jump_init_speed = 500;

let space_pressed = false;
let mid_jump = true;

let curr_anim = "stop";

let j_pressed = false;

function preload_player(s) {
    //s.load.image("proiettile_asset", "assets/images/PLAYER/Proiettile.png");
}

function configure_player_animations(s, player) {
    // Configurazione animazioni
    PP.assets.sprite.animation_add_list(player, "run", [0, 1, 2, 3, 4, 5, 6, 7, 8], 13, -1);
    PP.assets.sprite.animation_add_list(player, "idle", [10, 11, 12, 13, 14, 15], 8, -1);
    PP.assets.sprite.animation_add(player, "jump_up", 3, 4, 10, 0);
    PP.assets.sprite.animation_add(player, "jump_down", 6, 7, 10, 0);
    PP.assets.sprite.animation_add(player, "stop", 21, 21, 10, 0);

    PP.assets.sprite.animation_add_list(player, "sparo_rinnovabile", [41, 42, 43, 36, 37, 38], 8, -1);
    PP.assets.sprite.animation_add_list(player, "sparo_inquinante", [51, 52, 53, 46, 47, 48], 11, -1);

    PP.assets.sprite.animation_add_list(player, "sparo_rinnovabile_fermo", [61, 62, 63, 56, 57, 58], 8, -1);
    PP.assets.sprite.animation_add_list(player, "sparo_inquinante_fermo", [71, 72, 73, 66, 67, 68], 11, -1);

    // HITBOX 
    PP.physics.set_collision_rectangle(player, 20, 44, -10, 30);
    player.ph_obj.body.setOffset(14, 8);

    // --- VARIABILI DI STATO ---
    player.sparo_attivo = false;
    player.coyote_counter = 0;

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
    let next_anim = curr_anim;


    // 1. SINCRONIZZAZIONE ARMA CON HUD

    if (typeof hud_modalita_inquinante !== 'undefined') { // Controlliamo se la variabile globale esiste (per evitare errori se HUD non è caricato)

        // Se c'è una discrepanza tra Player e HUD, aggiorniamo il Player
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

    // Variabile per capire se mi sto muovendo
    let is_moving = false;
    let target_velocity_x = 0;

    // Controllo input movimento
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

    // --- GESTIONE VELOCITÀ MENTRE SI SPARA ---
    if (player.sparo_attivo && is_moving) {
        // Se sto sparando e mi muovo, forzo la velocità a 150

        let direzione;
        // Calcolo direzione esteso (NO ternario)
        if (player.geometry.flip_x == true) {
            direzione = -1;
        } else {
            direzione = 1;
        }

        target_velocity_x = 150 * direzione;
    }

    // Applico la velocità calcolata
    PP.physics.set_velocity_x(player, target_velocity_x);



    // 4. LOGICA DI SALTO E COYOTE TIME

    let is_on_solid_ground = player.ph_obj.body.blocked.down;

    if (is_on_solid_ground) {
        player.coyote_counter = 10;
        mid_jump = true;
    } else {
        if (player.coyote_counter > 0) {
            player.coyote_counter--;
        }
    }

    if (player.coyote_counter > 0) {
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false) {
            space_pressed = true;
            PP.physics.set_velocity_y(player, -jump_init_speed);
            player.coyote_counter = 0;
        }
    }

    if (PP.interactive.kb.is_key_up(s, PP.key_codes.SPACE)) {
        space_pressed = false;
    }

    // 5. GESTIONE ANIMAZIONI

    let anim_sparo_corsa = player.anim_sparo_corrente; // "sparo" o "sparo_inquinante"
    let anim_sparo_fermo;

    // Decido quale animazione "fermo" usare in base alla modalità arma
    if (player.modalita_inquinante == true) {
        anim_sparo_fermo = "sparo_inquinante_fermo";
    } else {
        anim_sparo_fermo = "sparo_rinnovabile_fermo";
    }

    if (!is_on_solid_ground) {
        // --- IN ARIA ---
        if (player.sparo_attivo) {
            // Se sparo in aria -> Uso quella di corsa (o potresti farne una specifica per il salto)
            next_anim = anim_sparo_corsa;
        } else {
            // Se NON sparo in aria
            if (PP.physics.get_velocity_y(player) < 0) {
                next_anim = "jump_up";
            } else if (PP.physics.get_velocity_y(player) > 0) {
                next_anim = "jump_down";
            }
        }

        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false && mid_jump == true) {
            space_pressed = true;
            PP.physics.set_velocity_y(player, -jump_init_speed);
            mid_jump = false;
        }

    } else {
        // --- A TERRA ---
        if (player.sparo_attivo) {
            // SE SPARO
            if (is_moving) {
                next_anim = anim_sparo_corsa; // Sparo mentre corro
            } else {
                next_anim = anim_sparo_fermo;  // Sparo da fermo
            }
        } else {
            // SE NON SPARO
            if (is_moving) {
                next_anim = "run";
            } else {
                next_anim = "idle";
            }
        }
    }

    // Applica animazione
    if (next_anim != curr_anim) {
        PP.assets.sprite.animation_play(player, next_anim);
        curr_anim = next_anim;
    }

    // =========================================================
    // GOD MODE (Tasto J)
    // =========================================================
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

        // Orizzontale
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.D)) {
            PP.physics.set_velocity_x(player, speed_fly);
        } else if (PP.interactive.kb.is_key_down(s, PP.key_codes.A)) {
            PP.physics.set_velocity_x(player, -speed_fly);
        } else {
            PP.physics.set_velocity_x(player, 0);
        }

        // Verticale
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.W) || PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
            PP.physics.set_velocity_y(player, -speed_fly);
        } else if (PP.interactive.kb.is_key_down(s, PP.key_codes.S)) {
            PP.physics.set_velocity_y(player, speed_fly);
        } else {
            PP.physics.set_velocity_y(player, 0);
        }

        return;
    }

    // DEBUG
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.P)) {
        let coord_x = Math.round(player.ph_obj.x);
        let coord_y = Math.round(player.ph_obj.y);
        console.clear();
        console.log(`POS: ${coord_x}, ${coord_y}`);
    }
}










// --- FUNZIONE SPARO ---
/* function try_fire_bullet(s, player) {
    let time_now = Date.now();

    // Verifica Cooldown (usa player.fire_rate che cambia premendo L)
    if (time_now > player.last_fired + player.fire_rate) {

        player.last_fired = time_now;

        let Y_OFFSET_SPARO = 25;
        let velocita = 600;

        let colpo = s.physics.add.sprite(player.geometry.x, player.geometry.y - Y_OFFSET_SPARO, "proiettile_asset");

        //colpo.setScale(0.1);
        colpo.body.allowGravity = false;

        // Se siamo in modalità inquinante, magari coloriamo il proiettile di verde
        if (player.modalita_inquinante) {
            colpo.setTint(0x00ff00); // Verde
        }

        if (player.geometry.flip_x) {
            colpo.setVelocityX(-velocita);
            colpo.setFlipX(true);
        } else {
            colpo.setVelocityX(velocita);
            colpo.setFlipX(false);
        }

        s.time.delayedCall(2000, () => {
            if (colpo.active) colpo.destroy();
        });

        if (typeof muri_livello !== 'undefined' && muri_livello) {
            s.physics.add.collider(colpo, muri_livello, function (b, m) {
                b.destroy();
            });
        }
    }
} */