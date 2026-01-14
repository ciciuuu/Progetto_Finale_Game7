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

    // Animazione Sparo Normale
    PP.assets.sprite.animation_add_list(player, "sparo", [20, 21, 22, 23, 24, 25, 26, 27, 28], 13, -1);
    // Animazione Sparo Inquinante (Nota: assicurati che gli indici siano corretti per la tua sprite)
    PP.assets.sprite.animation_add_list(player, "sparo_inquinante", [20, 21, 22, 23, 24, 25, 26, 27, 28], 15, -1); // Messo a 20fps per farlo sembrare più veloce

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
    player.fire_rate = 500;     // Lento
    player.anim_sparo_corrente = "sparo";

    // GOD MODE (VOLO)
    player.god_mode = false;
}

function manage_player_update(s, player, muri_livello) {
    let next_anim = curr_anim;

    // 1. LOGICA CAMBIO ARMA (Rimane uguale a prima)
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.L)) {
        if (player.tasto_R_rilasciato) {
            player.modalita_inquinante = !player.modalita_inquinante;
            if (player.modalita_inquinante) {
                console.log("Arma: INQUINANTE");
                player.fire_rate = 150;
                player.anim_sparo_corrente = "sparo_inquinante";
            } else {
                let player_speed = 300;
                let player_speed2 = 600;

                let jump_init_speed = 500;

                let space_pressed = false;
                let mid_jump = true;

                let curr_anim = "stop";

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

                    // Animazione Sparo Normale
                    PP.assets.sprite.animation_add_list(player, "sparo", [20, 21, 22, 23, 24, 25, 26, 27, 28], 13, -1);
                    // Animazione Sparo Inquinante
                    PP.assets.sprite.animation_add_list(player, "sparo_inquinante", [20, 21, 22, 23, 24, 25, 26, 27, 28], 15, -1);

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
                    player.fire_rate = 500;     // Lento
                    player.anim_sparo_corrente = "sparo";
                }

                function manage_player_update(s, player, muri_livello) {
                    let next_anim = curr_anim;

                    // 1. LOGICA CAMBIO ARMA (Uso tasto R)
                    if (PP.interactive.kb.is_key_down(s, PP.key_codes.R)) {
                        if (player.tasto_R_rilasciato) {

                            // Cambio la modalità (da vero a falso e viceversa)
                            player.modalita_inquinante = !player.modalita_inquinante;

                            if (player.modalita_inquinante) {
                                console.log("Arma: INQUINANTE");
                                player.fire_rate = 150;
                                player.anim_sparo_corrente = "sparo_inquinante";
                            } else {
                                console.log("Arma: NORMALE");
                                player.fire_rate = 500;
                                player.anim_sparo_corrente = "sparo";
                            }
                            player.tasto_R_rilasciato = false;
                        }
                    } else {
                        player.tasto_R_rilasciato = true;
                    }

                    // 2. GESTIONE SPARO
                    if (PP.interactive.kb.is_key_down(s, PP.key_codes.N)) {
                        player.sparo_attivo = true;
                        gestisci_sparo(s, player, muri_livello);
                    } else {
                        player.sparo_attivo = false;
                    }

                    // =========================================================
                    // 3. GESTIONE MOVIMENTO
                    // =========================================================

                    let anim_se_spara = player.sparo_attivo ? player.anim_sparo_corrente : "run";
                    let anim_se_fermo = player.sparo_attivo ? player.anim_sparo_corrente : "idle";

                    if (PP.interactive.kb.is_key_down(s, PP.key_codes.D)) {
                        PP.physics.set_velocity_x(player, + player_speed);
                        player.geometry.flip_x = false;
                        player.ph_obj.body.setOffset(14, 8);
                        next_anim = anim_se_spara;
                    }
                    else if (PP.interactive.kb.is_key_down(s, PP.key_codes.A)) {
                        PP.physics.set_velocity_x(player, - player_speed);
                        player.geometry.flip_x = true;
                        player.ph_obj.body.setOffset(20, 8);
                        next_anim = anim_se_spara;
                    }
                    else if (PP.interactive.kb.is_key_down(s, PP.key_codes.C)) {
                        PP.physics.set_velocity_x(player, + player_speed2);
                        player.geometry.flip_x = false;
                        player.ph_obj.body.setOffset(14, 8);
                        next_anim = anim_se_spara;
                    }
                    else if (PP.interactive.kb.is_key_down(s, PP.key_codes.Z)) {
                        PP.physics.set_velocity_x(player, - player_speed2);
                        player.geometry.flip_x = true;
                        player.ph_obj.body.setOffset(20, 8);
                        next_anim = anim_se_spara;
                    }
                    else {
                        PP.physics.set_velocity_x(player, 0);
                        next_anim = anim_se_fermo;
                    }

                    // =========================================================
                    // 4. LOGICA DI SALTO E COYOTE TIME
                    // =========================================================
                    let is_on_solid_ground = player.ph_obj.body.blocked.down;

                    if (is_on_solid_ground) {
                        player.coyote_counter = 10;
                        mid_jump = true;
                    } else {
                        if (player.coyote_counter > 0) player.coyote_counter--;
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

                    // Animazioni in aria
                    if (!is_on_solid_ground) {
                        if (player.sparo_attivo) {
                            next_anim = player.anim_sparo_corrente;
                        } else {
                            if (PP.physics.get_velocity_y(player) < 0) next_anim = "jump_up";
                            else if (PP.physics.get_velocity_y(player) > 0) next_anim = "jump_down";
                        }

                        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false && mid_jump == true) {
                            space_pressed = true;
                            PP.physics.set_velocity_y(player, -jump_init_speed);
                            mid_jump = false;
                        }
                    }

                    // Applica animazione
                    if (next_anim != curr_anim) {
                        PP.assets.sprite.animation_play(player, next_anim);
                        curr_anim = next_anim;
                    }

                    // DEBUG
                    if (PP.interactive.kb.is_key_down(s, PP.key_codes.P)) {
                        let coord_x = Math.round(player.ph_obj.x);
                        let coord_y = Math.round(player.ph_obj.y);
                        console.clear();
                        console.log(`POS: ${coord_x}, ${coord_y}`);
                    }
                }
                console.log("Arma: NORMALE");
                player.fire_rate = 500;
                player.anim_sparo_corrente = "sparo";
            }
            player.tasto_R_rilasciato = false;
        }
    } else {
        player.tasto_R_rilasciato = true;
    }

    // 2. GESTIONE SPARO
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.N)) {
        player.sparo_attivo = true;

        // ORA CHIAMIAMO LA FUNZIONE ESTERNA!
        // Non serve più 'try_fire_bullet' interna.
        gestisci_sparo(s, player, muri_livello);

    } else {
        player.sparo_attivo = false;
    }

    // =========================================================
    // 3. GESTIONE MOVIMENTO (Unificata)
    // =========================================================

    // Determiniamo quale animazione di sparo usare se stiamo sparando
    let anim_se_spara = player.sparo_attivo ? player.anim_sparo_corrente : "run";
    let anim_se_fermo = player.sparo_attivo ? player.anim_sparo_corrente : "idle";

    if (PP.interactive.kb.is_key_down(s, PP.key_codes.D)) {
        // --- DESTRA ---
        PP.physics.set_velocity_x(player, + player_speed);
        player.geometry.flip_x = false;
        player.ph_obj.body.setOffset(14, 8);
        next_anim = anim_se_spara;
    }
    else if (PP.interactive.kb.is_key_down(s, PP.key_codes.A)) {
        // --- SINISTRA ---
        PP.physics.set_velocity_x(player, - player_speed);
        player.geometry.flip_x = true;
        player.ph_obj.body.setOffset(20, 8);
        next_anim = anim_se_spara;
    }
    else if (PP.interactive.kb.is_key_down(s, PP.key_codes.C)) {
        // --- CORSA VELOCE ---
        PP.physics.set_velocity_x(player, + player_speed2);
        player.geometry.flip_x = false;
        player.ph_obj.body.setOffset(14, 8);
        next_anim = anim_se_spara;
    }
    else if (PP.interactive.kb.is_key_down(s, PP.key_codes.Z)) {
        // --- CORSA VELOCE INDIETRO ---
        PP.physics.set_velocity_x(player, - player_speed2);
        player.geometry.flip_x = true;
        player.ph_obj.body.setOffset(20, 8);
        next_anim = anim_se_spara;
    }
    else {
        // --- FERMO ---
        PP.physics.set_velocity_x(player, 0);
        next_anim = anim_se_fermo;
    }

    // =========================================================
    // 4. LOGICA DI SALTO E COYOTE TIME
    // =========================================================
    let is_on_solid_ground = player.ph_obj.body.blocked.down;

    if (is_on_solid_ground) {
        player.coyote_counter = 10;
        mid_jump = true;
    } else {
        if (player.coyote_counter > 0) player.coyote_counter--;
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

    // Animazioni in aria
    if (!is_on_solid_ground) {
        if (player.sparo_attivo) {
            next_anim = player.anim_sparo_corrente; // Usa l'animazione corretta in aria
        } else {
            if (PP.physics.get_velocity_y(player) < 0) next_anim = "jump_up";
            else if (PP.physics.get_velocity_y(player) > 0) next_anim = "jump_down";
        }

        // Doppio Salto
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false && mid_jump == true) {
            space_pressed = true;
            PP.physics.set_velocity_y(player, -jump_init_speed);
            mid_jump = false;
        }
    }

    // Applica animazione
    if (next_anim != curr_anim) {
        PP.assets.sprite.animation_play(player, next_anim);
        curr_anim = next_anim;
    }


    // ==================================================================================================================
    // GOD MODE (Tasto J) - Attiva/Disattiva Volo
    // ==================================================================================================================
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.J)) {
        if (j_pressed == false) {
            player.god_mode = !player.god_mode; // Inverti stato
            j_pressed = true;

            if (player.god_mode == true) {
                console.log("GOD MODE: ON");
                player.ph_obj.body.allowGravity = false; // Disattiva gravità
                PP.physics.set_velocity_y(player, 0);    // Ferma caduta
                player.ph_obj.setTint(0xFFFF00);         // Diventa Giallo
            } else {
                console.log("GOD MODE: OFF");
                player.ph_obj.body.allowGravity = true;  // Riattiva gravità
                player.ph_obj.clearTint();               // Colore normale
            }
        }
    } else {
        j_pressed = false;
    }

    // SE SIAMO IN GOD MODE, LOGICA MOVIMENTO DIVERSA (Volo Libero)
    if (player.god_mode == true) {
        let speed_fly = 600;

        // Orizzontale
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.D)) {
            PP.physics.set_velocity_x(player, speed_fly);
        } else if (PP.interactive.kb.is_key_down(s, PP.key_codes.A)) {
            PP.physics.set_velocity_x(player, -speed_fly);
        } else {
            PP.physics.set_velocity_x(player, 0);
        }

        // Verticale (Vola su e giù con W e S)
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.W)) {
            PP.physics.set_velocity_y(player, -speed_fly);
        } else if (PP.interactive.kb.is_key_down(s, PP.key_codes.S)) {
            PP.physics.set_velocity_y(player, speed_fly);
        } else {
            PP.physics.set_velocity_y(player, 0);
        }

        return; // IMPORTANTE: Esce qui per non eseguire la fisica normale (gravità, salti)
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