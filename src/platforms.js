let img_platform;
let platform_2;

function preload_platforms(s) {
    // Load dell'immagine della piattaforma
    img_platform   = PP.assets.image.load(s, "assets/images/platform.png");
}

function collision_platform(s, player, platform) {
    // Funzione di collisione con le piattaforme.
    // Qui devo verificare che il giocatore si trovi sopra
    // la piattaforma e in quel caso aggiorno la variabile che
    // abilita il salto (v. player.js)
    if( player.geometry.x >= platform.geometry.x &&
        player.geometry.x <= platform.geometry.x + platform.geometry.display_width) {
            player.is_on_platform = true;
    }
}

function create_platforms(s, player) {

    // Piattaforma fissa
    let platform = PP.assets.image.add(s, img_platform, 400, 450, 0, 0);
    PP.physics.add(s, platform, PP.physics.type.STATIC); 
    PP.physics.add_collider_f(s, player, platform, collision_platform);

    // Piattaforma mobile
    platform_2 = PP.assets.image.add(s, img_platform, 800, 300, 0, 0);
    PP.physics.add(s, platform_2, PP.physics.type.DYNAMIC); 
    PP.physics.set_immovable(platform_2, true);
    PP.physics.set_allow_gravity(platform_2, false);    
    PP.physics.add_collider_f(s, player, platform_2, collision_platform);
    PP.physics.set_velocity_x(platform_2, 100);

    // Riduco i collision boundaries in modo che
    // l'erba non causi un "innalzamento" del giocatore
    PP.physics.set_collision_rectangle(platform, 400, 68, 0, 21);

}

function update_platforms(s) {

    // Aggiorno la velocita' della piattaforma mobile nel
    // caso in cui si trovi al limite destro o il limite sinistro
    // scelto (800 - 1200)

    if(platform_2.geometry.x >= 1200) {
        PP.physics.set_velocity_x(platform_2, -100);
    }
    else if(platform_2.geometry.x <= 800) {
        PP.physics.set_velocity_x(platform_2, 100);
    }


}
