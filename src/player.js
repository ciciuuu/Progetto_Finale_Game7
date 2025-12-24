let player_speed = 300;
let player_speed2 = 600;

let jump_init_speed = 500;

let space_pressed = false;
let mid_jump = true;
// Variabile obsoleta: floor_height = 620;

let curr_anim = "stop";

function preload_player(s) {
}

function configure_player_animations(s, player) {
    // Configurazione animazioni
    PP.assets.sprite.animation_add_list(player, "run", [0, 1, 2, 3, 4, 5, 6, 7, 8], 13, -1);
    PP.assets.sprite.animation_add_list(player, "idle", [10, 11, 12, 13, 14, 15], 8, -1);
    PP.assets.sprite.animation_add(player, "jump_up", 3, 4, 10, 0);
    PP.assets.sprite.animation_add(player, "jump_down", 6, 7, 10, 0);
    PP.assets.sprite.animation_add(player, "stop", 21, 21, 10, 0);
    PP.assets.sprite.animation_add_list(player, "sparo", [20, 21, 22, 23, 24, 25, 26, 27, 28], 13, -1);
    PP.assets.sprite.animation_play(player, "stop");

    // HITBOX 
    PP.physics.set_collision_rectangle(player, 20, 44, -10, 30);

    // Per centrare la hitbox
    player.ph_obj.body.setOffset(14, 8);

    // --- VARIABILI DI STATO (MEMORIA) ---
    player.sparo_attivo = false;    
    
    player.coyote_counter = 0;
}

function manage_player_update(s, player) {
    let next_anim = curr_anim;

    // 1. GESTIONE MODALITÀ SPARO (TASTO N - HOLD)
    // Se N è premuto = TRUE. Se N non è premuto = FALSE.
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.N)) {
        player.sparo_attivo = true;
    } else {
        player.sparo_attivo = false;
    }

    // 2. GESTIONE MOVIMENTO (Unificata)

    if (PP.interactive.kb.is_key_down(s, PP.key_codes.D)) {
        // --- DESTRA ---
        PP.physics.set_velocity_x(player, + player_speed);
        player.geometry.flip_x = false;
        player.ph_obj.body.setOffset(14, 8);

        // Decidiamo l'animazione in base alla modalità
        if (player.sparo_attivo) {
            next_anim = "sparo";
        } else {
            next_anim = "run";
        }

    } else if (PP.interactive.kb.is_key_down(s, PP.key_codes.A)) {
        // --- SINISTRA ---
        PP.physics.set_velocity_x(player, - player_speed);
        player.geometry.flip_x = true;
        player.ph_obj.body.setOffset(20, 8); // Offset per specchiamento

        // Decidiamo l'animazione in base alla modalità
        if (player.sparo_attivo) {
            next_anim = "sparo";
        } else {
            next_anim = "run";
        }
    } else if (PP.interactive.kb.is_key_down(s, PP.key_codes.C)) {
        // --- DESTRA ---
        PP.physics.set_velocity_x(player, + player_speed2);
        player.geometry.flip_x = false;
        player.ph_obj.body.setOffset(14, 8);

        // Decidiamo l'animazione in base alla modalità
        if (player.sparo_attivo) {
            next_anim = "sparo";
        } else {
            next_anim = "run";
        }

    } else if (PP.interactive.kb.is_key_down(s, PP.key_codes.Z)) {
        // --- SINISTRA ---
        PP.physics.set_velocity_x(player, - player_speed2);
        player.geometry.flip_x = true;
        player.ph_obj.body.setOffset(20, 8); // Offset per specchiamento

        // Decidiamo l'animazione in base alla modalità
        if (player.sparo_attivo) {
            next_anim = "sparo";
        } else {
            next_anim = "run";
        }

    } else {
        // --- FERMO ---
        PP.physics.set_velocity_x(player, 0);

        if (player.sparo_attivo) {
            next_anim = "sparo";
        } else {
            next_anim = "idle";
        }
    }


    

    // 3. LOGICA DI SALTO

    // Controlla se il corpo del player è bloccato verso il basso
    let is_on_solid_ground = player.ph_obj.body.blocked.down;


    // --- GESTIONE COYOTE TIME ---
    if (is_on_solid_ground) {
        // Se siamo a terra, ricarichiamo il "tempo di grazia"
        // 10 frame = circa 0.16 secondi (a 60 FPS). Modifica questo numero se vuoi più/meno tempo.
        player.coyote_counter = 10; 
        
        mid_jump = true; // Resetta il doppio salto
    } else {
        // Se siamo in aria, consumiamo il tempo di grazia
        if (player.coyote_counter > 0) {
            player.coyote_counter = player.coyote_counter - 1;
        }
    }


    if (player.coyote_counter > 0) {
        
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false) {
            space_pressed = true;
            PP.physics.set_velocity_y(player, -jump_init_speed);
            
            // IMPORTANTE: Azzero subito il contatore per non poter risaltare a mezz'aria
            player.coyote_counter = 0; 
        }
    }

   /*  if (is_on_solid_ground) {
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false) {
            space_pressed = true;
            PP.physics.set_velocity_y(player, -jump_init_speed);
        }
        if (PP.interactive.kb.is_key_up(s, PP.key_codes.SPACE) && space_pressed == true) {
            space_pressed = false;
        }
        mid_jump = true;
    } */

    // Logica Animazioni Salto (Sovrascrive run/sparo se in aria)
    if (!is_on_solid_ground) {

        // Se stiamo sparando in aria, diamo priorità all'animazione di sparo
        if (player.sparo_attivo) {
            next_anim = "sparo";
        } else {
            // Altrimenti animazioni di salto normali
            if (PP.physics.get_velocity_y(player) < 0) {
                next_anim = "jump_up";
            }
            else if (PP.physics.get_velocity_y(player) > 0) {
                next_anim = "jump_down";
            }
        }

        // Doppio salto / Salto in aria
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false && mid_jump == true) {
            space_pressed = true;
            PP.physics.set_velocity_y(player, -jump_init_speed);
            mid_jump = false;
        }
        if (PP.interactive.kb.is_key_up(s, PP.key_codes.SPACE) && space_pressed == true) {
            space_pressed = false;
        }
    }

    // Applica animazione se è cambiata
    if (next_anim != curr_anim) {
        PP.assets.sprite.animation_play(player, next_anim);
        curr_anim = next_anim;
    }



    // STRUMENTO DEBUG COORDINATE (Tasto P)
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.P)) {
        
        // Arrotondiamo i numeri per non avere virgole inutili
        let coord_x = Math.round(player.ph_obj.x);
        let coord_y = Math.round(player.ph_obj.y);

        console.clear(); // Pulisce la console per leggere meglio
        console.log("%c--- COORDINATE COPIABILI ---", "color: #00ff00; font-weight: bold; font-size: 14px;");
        console.log(`X: ${coord_x}`);
        console.log(`Y: ${coord_y}`);
        console.log(`Codice pronto: let pos_x = ${coord_x}; let pos_y = ${coord_y};`);
        console.log("------------------------------");
    }



    //  SPARO PROIETTILE (Tasto N) -- RENDERE TUTTO IN PHASER
    // Offset in pixel sopra il centro del player
    // const Y_OFFSET_SPARO = 25;

    /*
  if (PP.interactive.kb.is_key_down(s, PP.key_codes.N)) {

    let time_now = Date.now();
    let fire_rate = 500; // Millisecondi tra uno sparo e l'altro (0.5 secondi)

    // Offset in pixel sopra il centro del player
    const Y_OFFSET_SPARO = 25;

    // Se è passato abbastanza tempo dall'ultimo sparo
    if (time_now > last_fired) {

      // 1. Calcola posizione di partenza (con offset Y corretto)
      let spawn_x = player.ph_obj.x;
      let spawn_y = player.ph_obj.y - Y_OFFSET_SPARO; // Sposta in alto

      // 2. Crea il proiettile usando il GRUPPO FISICO 'proiettile'
      let b = proiettile.create(spawn_x, spawn_y, asset_proiettile);

      // 3. Imposta la scala 
      b.setScale(0.1);
      b.body.setAllowGravity(false);

      // 4. Gestione Direzione (Destra/Sinistra)
      let velocita_proiettile = 600;
      if (player.geometry.flip_x) {
        b.setVelocityX(-velocita_proiettile); // Spara a Sinistra
        b.setFlipX(true);
      } else {
        b.setVelocityX(velocita_proiettile);  // Spara a Destra
        b.setFlipX(false);
      }

      // 5. Autodistruzione dopo 2 secondi
      s.time.delayedCall(2000, () => {
        if (b.active) b.destroy();
      });

      // Aggiorna il tempo dell'ultimo sparo
      last_fired = time_now + fire_rate;
    }
  } */
}