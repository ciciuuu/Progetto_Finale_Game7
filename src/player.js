let player_speed    = 500;
let jump_init_speed = 300;
let floor_height    = 620;

let curr_anim = "stop"; // Questa variabile contiene l'animazione corrente

let img_shuriken;

function preload_player(s) {
}

function configure_player_animations(s, player) {
    // Configuro le animazioni secondo lo spritesheet
    PP.assets.sprite.animation_add_list(player, "run", [0, 1, 2, 3, 4, 5, 6, 7, 8,], 13, -1);    // Lista di frame, a 10 fps, inifito
    PP.assets.sprite.animation_add(player, "jump_up", 3, 4, 10, 0);
    PP.assets.sprite.animation_add(player, "jump_down", 6, 7, 10, 0);
    PP.assets.sprite.animation_add(player, "stop", 21, 21, 10, 0);
    PP.assets.sprite.animation_play(player, "stop");

    // Qui imposto la scala del personaggio
    player.geometry.scale_x = 3;
    player.geometry.scale_y = 3;

}

function manage_player_update(s, player) {
    // Questa funzione e' chiamata ad ogni frame dalla update()

    // Creo una variabile che conterra' l'animazione futura
    // per poter verificare se cambia dalla attuale
    let next_anim = curr_anim;

    if(PP.interactive.kb.is_key_down(s, PP.key_codes.D)) {
        // Se e' premuto il tasto destro...
        PP.physics.set_velocity_x(player, + player_speed);
        next_anim = "run";
    }
    else if(PP.interactive.kb.is_key_down(s, PP.key_codes.A)) {
        // Se e' premuto il tasto sinistro...
        PP.physics.set_velocity_x(player, - player_speed);
        next_anim = "run";
    } else {
        // Se non e' premuto alcun tasto...
        PP.physics.set_velocity_x(player, 0);
        next_anim = "stop";
    }

    if(player.geometry.y>=floor_height-1 || player.is_on_platform) {
        // Se mi trovo sul pavimento OPPURE su una piattaforma...

        if(PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
            // ... e premo il tasto spazio, allo salto
            PP.physics.set_velocity_y(player, -jump_init_speed);
        }

        // Non gestisco qui le animazioni del salto, ma piu' avanti
    }

    player.is_on_platform = false;  // Resetto il flag che viene messo a true quando il giocatore 
                                    // si trova sulla piattaforma

    // Le animazioni del salto vengono gestite in base alla velocita'
    // verticale
    if(PP.physics.get_velocity_y(player) < 0) {
        next_anim = "jump_up";
    }
    else if(PP.physics.get_velocity_y(player) > 0) {
        next_anim = "jump_down";
    }

    // Nota: non gestisco il caso == 0, perche' in quel caso l'animazione
    // e' quella del movimento scelta prima.


    // Ora verifico l'animazione scelta:
    // - se e' uguale a quella attuale, non faccio niente
    // - se e' cambiata, la applico e aggiorno curr_anim
    if(next_anim != curr_anim) {
        PP.assets.sprite.animation_play(player, next_anim);
        curr_anim = next_anim;
    }

    // Logica per specchiare il giocatore:
    if (PP.physics.get_velocity_x(player) < 0) {
        player.geometry.flip_x = true;
    }
    else if (PP.physics.get_velocity_x(player) > 0) {
        player.geometry.flip_x = false;
    }

}
