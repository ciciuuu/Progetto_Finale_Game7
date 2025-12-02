let img_sfondo_intero;
let img_player;

let player;
let floor;
let txt_score;
let txt_mushrooms;

function preload(s) {
    console.log("Executing preload() - SCENE");

    // Carichiamo gli asset grafici
    img_sfondo_intero = PP.assets.image.load(s, "assets/images/sfondo_intero.png");
    img_player     = PP.assets.sprite.load_spritesheet(s, "assets/images/spritesheet_player.png", 52, 52);
    

    // Preload dei vari elementi della scena
    preload_platforms(s);
    preload_player(s);
    preload_enemy(s);
}

function collider_test(s,a,b) {
    console.log("Player colliding with the box!");
}

function end_game() {
    if (PP.game_state.get_variable("mushrooms") < 10) {
        PP.scenes.start("game_over");
    }
}

function create(s) {
    console.log("Executing create() - SCENE");

    // Inseriamo background e giocatore
    PP.assets.tilesprite.add(s, img_sfondo_intero, 0, 0,  10000, 800,  0, 0);

    player = PP.assets.sprite.add(s, img_player, 150, 620, 0.5, 1);
    // Aggiungiamo il giocatore alla fisica come entità dinamica
    PP.physics.add(s, player, PP.physics.type.DYNAMIC); 


    // Creiamo un pavimento "trasparente"
    floor = PP.shapes.rectangle_add(s, 640, 620, 10000, 1, "0x000000", 0);
    // Aggiungiamo il pavimento alla fisica come entità statica
    PP.physics.add(s, floor, PP.physics.type.STATIC); 

    // Creiamo un collider tra pavimento e giocatore
    PP.physics.add_collider(s, player, floor);

    configure_player_animations(s, player); // Impostazione animazioni giocatore
    create_platforms(s, player);            // Creazione piattaforme
    create_enemy(s, floor, player);

    // Impostiamo la camera che segua il giocatore
    PP.camera.start_follow(s, player, 0, 220);

    txt_mushrooms = PP.shapes.text_add(s, 50, 50, "Mushrooms: " + PP.game_state.get_variable("mushrooms"));

    console.log(PP.game_state.get_variable("coins"));

    PP.timers.add_timer(s,60000, end_game, false);
}

function update(s) {
    // Azioni che vengono eseguite a ogni frame del gioco

    manage_player_update(s, player);    // Posizione del giocatore e animazioni
    update_platforms(s);                // Movimento piattaforme
    update_enemy(s);

    PP.shapes.text_change(txt_mushrooms, "Mushrooms: " + PP.game_state.get_variable("mushrooms"));
}

function destroy(s) {
    console.log("Executing destroy() - SCENE");

}

PP.scenes.add("base", preload, create, update, destroy);