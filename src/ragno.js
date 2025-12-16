let img_enemy;
let img_enemy2;
let enemy;
let enemy2;

let vulnerable = true;

function preload_enemy(s) {
    // Carico l'immagine come spritesheets
    img_enemy = PP.assets.sprite.load_spritesheet(s,
        "assets/images/RAGNO/camminata_danno 36x36.png", 36, 36);

    img_enemy2 = PP.assets.sprite.load_spritesheet(s,
        "assets/images/RAGNO/attacco 59x59.png", 59, 59);


}

function set_vulnerable() {
    vulnerable = true;
}

function take_damage(s, p1, p2) {
    if (vulnerable) {
        vulnerable = false;
        PP.game_state.set_variable("HP", PP.game_state.get_variable("HP") - 1);
        if (PP.game_state.get_variable("HP") <= 0) {
            PP.scenes.start("game_over");
        }
        PP.timers.add_timer(s, 500, set_vulnerable, false);
    }
}


function create_enemy(s, player) {



    enemy = PP.assets.sprite.add(s, img_enemy, 0, 0, 0.5, 1);
  /*   // PP.physics.add(s, enemy, PP.physics.type.DYNAMIC);
    
    // Velocità iniziale del nemico (verso dx)
    PP.physics.set_velocity_x(enemy, 100);

    // Aggiungo le animazioni walk dx/sx
    PP.assets.sprite.animation_add(enemy, "walk_left", 0, 3, 15, -1);
    PP.assets.sprite.animation_add(enemy, "walk_right", 0, 3, 15, -1);

    // Iniziamo andando a destra
    PP.assets.sprite.animation_play(enemy, "walk_right");

    // Qui imposto la scala del personaggio
    enemy.geometry.scale_x = 2;
    enemy.geometry.scale_y = 2; */





    enemy2 = PP.assets.sprite.add(s, img_enemy, 5, 0, 0.5, 1);



}






/* function create_enemy(s, player) {
    enemy = PP.assets.sprite.add(s, img_enemy, 0, 0, 0.5, 1);
    PP.physics.add(s, enemy, PP.physics.type.DYNAMIC);
    PP.physics.add_collider(s, enemy);

    PP.physics.add_overlap_f(s, enemy, player, take_damage);

    // Velocità iniziale del nemico (verso dx)
    PP.physics.set_velocity_x(enemy, 100);

    // Aggiungo le animazioni walk dx/sx
    PP.assets.sprite.animation_add(enemy, "walk_left", 0, 3, 15, -1);
    PP.assets.sprite.animation_add(enemy, "walk_right", 0, 3, 15, -1);

    // Iniziamo andando a destra
    PP.assets.sprite.animation_play(enemy, "walk_right");

    // Qui imposto la scala del personaggio
    enemy.geometry.scale_x = 2;
    enemy.geometry.scale_y = 2;


    enemy2 = PP.assets.sprite.add(s, img_enemy, 5, 0, 0.5, 1);



} */



function update_enemy(s) {




    /* function create_enemy(s, player) {
    enemy = PP.assets.sprite.add(s, img_enemy, 800, 500, 0.5, 1);
    PP.physics.add(s, enemy, PP.physics.type.DYNAMIC);
    PP.physics.add_collider(s, enemy);

    PP.physics.add_overlap_f(s, enemy, player, take_damage);

    // Velocità iniziale del nemico (verso dx)
    PP.physics.set_velocity_x(enemy, 100);

    // Aggiungo le animazioni walk dx/sx
    PP.assets.sprite.animation_add(enemy, "walk_left", 0, 3, 15, -1);
    PP.assets.sprite.animation_add(enemy, "walk_right", 0, 3, 15, -1);

    // Iniziamo andando a destra
    PP.assets.sprite.animation_play(enemy, "walk_right");

    // Qui imposto la scala del personaggio
    enemy.geometry.scale_x = 2;
    enemy.geometry.scale_y = 2;

}

function update_enemy(s) {
    if(enemy.geometry.x >= 1000) {
        // Hit right boundary
        PP.physics.set_velocity_x(enemy, -100);
        PP.assets.sprite.animation_play(enemy, "walk_left");
        enemy.geometry.flip_x = false;
    }
    else if (enemy.geometry.x <= 600) {
        // Hit left boundary
        PP.physics.set_velocity_x(enemy, 100);
        PP.assets.sprite.animation_play(enemy, "walk_right");
        enemy.geometry.flip_x = true;
    }
} */



    /* // DEBUG: Premi 'L' per vedere la distanza in console
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.P)) {

        // 1. CONFIGURAZIONE: CAMBIA SOLO IL NOME QUI SOTTO
        let OGGETTO_TARGET = enemy; // <--- Sostituisci 'ingranaggio' con 'enemy1' o altro


        // 2. Otteniamo gli oggetti nativi
        let p_obj = player.ph_obj;
        let t_obj = OGGETTO_TARGET.ph_obj; // t_obj sta per Target Object
        let cam = s.cameras.main;

        // 3. Calcolo Posizione "Mondo" Intelligente
        // Se l'oggetto ha scrollFactor 0 (è un HUD fisso), dobbiamo sommare la camera.
        // Se l'oggetto è normale (si muove col livello), usiamo la sua coordinata diretta.
        let target_world_x = (t_obj.scrollFactorX === 0) ? cam.scrollX + t_obj.x : t_obj.x;
        let target_world_y = (t_obj.scrollFactorY === 0) ? cam.scrollY + t_obj.y : t_obj.y;

        // 4. Calcolo Distanza
        let dist_x = Math.abs(p_obj.x - target_world_x);
        let dist_y = Math.abs(p_obj.y - target_world_y);

        console.clear();
        console.log("--- DEBUG DISTANZA ---");
        console.log(`Player: x=${p_obj.x.toFixed(0)}, y=${p_obj.y.toFixed(0)}`);
        console.log(`Target (${OGGETTO_TARGET == ingranaggio ? "HUD" : "World"}): x=${target_world_x.toFixed(0)}, y=${target_world_y.toFixed(0)}`);
        console.log(`%cDISTANZA X: ${dist_x.toFixed(2)}`, "color: yellow; font-weight: bold;");
        console.log(`%cDISTANZA Y: ${dist_y.toFixed(2)}`, "color: yellow; font-weight: bold;");
    } */
}


