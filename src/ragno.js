let img_enemy;
let img_enemy2;
let enemy;

let vulnerable = true;

function preload_enemy(s) {
    // Carico l'immagine come spritesheets
    img_enemy = PP.assets.sprite.load_spritesheet(s, 
                        "assets/images/RAGNO/camminata_danno.png", 36, 36);

    img_enemy2 = PP.assets.sprite.load_spritesheet(s, 
                        "assets/images/RAGNO/attacco.png", 59, 59);


}

function set_vulnerable() {
    vulnerable = true;
}

function take_damage(s, p1, p2) {
    if (vulnerable){
        vulnerable = false;
        PP.game_state.set_variable("HP", PP.game_state.get_variable("HP") - 1);
        if (PP.game_state.get_variable("HP") <= 0) {
            PP.scenes.start("game_over");v
        }
        PP.timers.add_timer(s,500, set_vulnerable,false);
    }
}

function create_enemy(s, floor, player) {
    enemy = PP.assets.sprite.add(s, img_enemy, 800, 500, 0.5, 1);
    PP.physics.add(s, enemy, PP.physics.type.DYNAMIC);
    PP.physics.add_collider(s, enemy, floor);

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
}