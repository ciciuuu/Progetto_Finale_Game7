let player_speed    = 300; // Ridotto per un controllo più fine su tile 32x32
let jump_init_speed = 600; // Valore più adatto per il salto su tile 32x32
// Variabile obsoleta: floor_height = 620;

let curr_anim = "stop"; 

function preload_player(s) {
}

function configure_player_animations(s, player) {
    // Configurazione animazioni
    PP.assets.sprite.animation_add_list(player, "run", [0, 1, 2, 3, 4, 5, 6, 7, 8], 13, -1);
    PP.assets.sprite.animation_add_list(player, "idle", [3, 8], 4, -1);
    PP.assets.sprite.animation_add(player, "jump_up", 3, 4, 10, 0);
    PP.assets.sprite.animation_add(player, "jump_down", 6, 7, 10, 0);
    PP.assets.sprite.animation_add(player, "stop", 21, 21, 10, 0);
    PP.assets.sprite.animation_play(player, "stop");

    // CORREZIONE SCALA
    player.geometry.scale_x = 1;
    player.geometry.scale_y = 1;

    // HITBOX 
    
    PP.physics.set_collision_rectangle(player, 25, 45, -10, 30);
    
    // player.ph_obj.body.setOffset(x, y) definisce il punto d'inizio dell'area.
    // Serve per centrare la hitbox all'interno dell'immagine scalata.
    player.ph_obj.body.setOffset(10, 8);
}

function manage_player_update(s, player) {
    let next_anim = curr_anim;
    
    // Logica Movimento Orizzontale (invariata)
    if(PP.interactive.kb.is_key_down(s, PP.key_codes.D)) {
        PP.physics.set_velocity_x(player, + player_speed);
        next_anim = "run";
        player.geometry.flip_x = false;
    }
    else if(PP.interactive.kb.is_key_down(s, PP.key_codes.A)) {
        PP.physics.set_velocity_x(player, - player_speed);
        next_anim = "run";
        player.geometry.flip_x = true;
    } else {
        PP.physics.set_velocity_x(player, 0);
        next_anim = "idle";
    }

    // --- NUOVA LOGICA DI SALTO BASATA SULLA FISICA ---
    
    // 1. Controlla se il corpo del player è bloccato verso il basso da un altro oggetto (i muri di Godot)
    let is_on_solid_ground = player.ph_obj.body.blocked.down; 

    // 2. Esegue il salto solo se il player è a terra
    if (is_on_solid_ground) { 
        if(PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
            PP.physics.set_velocity_y(player, -jump_init_speed);
        }
        // Se a terra e fermo (o in corsa), resetta l'animazione di caduta/salto
    }

    // 3. Logica Animazioni (si basa sulla velocità Y)
    if (!is_on_solid_ground) {
        if(PP.physics.get_velocity_y(player) < 0) {
            next_anim = "jump_up";
        }
        else if(PP.physics.get_velocity_y(player) > 0) {
            next_anim = "jump_down";
        }
    }
    // Se is_on_solid_ground è TRUE, l'animazione sarà "run" o "stop" (impostata prima).

    // Applica animazione
    if(next_anim != curr_anim) {
        PP.assets.sprite.animation_play(player, next_anim);
        curr_anim = next_anim;
    }
}