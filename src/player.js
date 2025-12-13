//Impostiamo una velocità massima di caduta (per la gravità) --> in modo che non "entri" in blocchi in cui non dovrebbe andare

let player_speed = 300;
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
    PP.assets.sprite.animation_play(player, "stop");

    // HITBOX 
    PP.physics.set_collision_rectangle(player, 20 , 44, -10, 30);
    PP.physics.set_friction_y(player, 0);

    // PP.physics.set_collision_circle(player, 23, 30 -10, 30);

    // Per centrare la hitbox
    player.ph_obj.body.setOffset(14, 8);
}

function manage_player_update(s, player) {
    let next_anim = curr_anim;

    // Logica Movimento Orizzontale (invariata)
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.D)) {
        PP.physics.set_velocity_x(player, + player_speed);
        next_anim = "run";
        player.geometry.flip_x = false;
        player.ph_obj.body.setOffset(14, 8);

    }
    else if (PP.interactive.kb.is_key_down(s, PP.key_codes.A)) {
        PP.physics.set_velocity_x(player, - player_speed);
        next_anim = "run";
        player.geometry.flip_x = true;
        player.ph_obj.body.setOffset(20, 8); //sposto l'offset quando il player va a destra, in modo che sia centrato

    } else {
        PP.physics.set_velocity_x(player, 0);
        next_anim = "idle";
    }

    // --- NUOVA LOGICA DI SALTO BASATA SULLA FISICA ---

    // 1. Controlla se il corpo del player è bloccato verso il basso da un altro oggetto (i muri di Godot)
    let is_on_solid_ground = player.ph_obj.body.blocked.down;


    // 2. Esegue il salto solo se il player è a terra

    if (is_on_solid_ground) {

        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false) {
            space_pressed = true;
            PP.physics.set_velocity_y(player, -jump_init_speed);
            // Se a terra e fermo (o in corsa), resetta l'animazione di caduta/salto
        }
        if (PP.interactive.kb.is_key_up(s, PP.key_codes.SPACE) && space_pressed == true){
            space_pressed = false;
        }
        mid_jump = true;
    }
    // if (is_on_air) {
    //     if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
    //         PP.physics.set_velocity_y(player, -jump_init_speed);
    //     }
    //     // Se a terra e fermo (o in corsa), resetta l'animazione di caduta/salto
    // }

    // 3. Logica Animazioni (si basa sulla velocità Y)
    if (!is_on_solid_ground) {

        if (PP.physics.get_velocity_y(player) < 0) {
            next_anim = "jump_up";
        }
        else if (PP.physics.get_velocity_y(player) > 0) {
            next_anim = "jump_down";
        }

        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false && mid_jump == true) {
            space_pressed = true;
            PP.physics.set_velocity_y(player, -jump_init_speed);
            mid_jump = false;
            // Se a terra e fermo (o in corsa), resetta l'animazione di caduta/salto
        }
        if (PP.interactive.kb.is_key_up(s, PP.key_codes.SPACE) && space_pressed == true){
            space_pressed = false;
        }
    }
    // Se is_on_solid_ground è TRUE, l'animazione sarà "run" o "stop" (impostata prima).

    // Applica animazione
    if (next_anim != curr_anim) {
        PP.assets.sprite.animation_play(player, next_anim);
        curr_anim = next_anim;
    }
}