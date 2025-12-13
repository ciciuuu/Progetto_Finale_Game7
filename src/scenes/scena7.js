let step_length = 10;
let floor_height = 650;
let max_jump_height = 300;
let jump_size = 20;

let img_background;
let ss_player;

let img_background_inst;
let player;

let cursor_keys;

let current_animation = null;
let next_animation = "idle";

let jump_cmd = false;

function preload(s) {
    console.log("Executing preload() - SCENE 7");

    // Carichiamo gli asset grafici
    img_background = PP.assets.image.load(s, "assets/images/background.png");
    ss_player      = PP.assets.sprite.load_spritesheet(s, "assets/images/spritesheet_player.png", 223, 190);

}

function create(s) {
    console.log("Executing create() - SCENE 7");

    img_background_inst = PP.assets.image.add(s, img_background, 0, 0, 0, 0);
    player              = PP.assets.sprite.add(s, ss_player, 200, floor_height, 0, 1);

    PP.assets.sprite.animation_add_list(player, "idle", [21, 22, 23, 24, 25, 24, 23, 22], 10, -1);
    PP.assets.sprite.animation_add_list(player, "run", [6, 13, 20, 27, 34], 30, -1);    // Lista di frame, a 30 fps, inifito
    PP.assets.sprite.animation_add(player, "jump", 36, 36, 30, -1);
}

function update(s) {
    next_animation = "idle";
    // E' stato premuto il tasto freccia sinistra e il giocatore è a destra del limite sinistro del quadro?
    if(PP.interactive.kb.is_key_down(s, PP.key_codes.LEFT) && player.geometry.x >= 0) {
        console.log("Pressed left arrow.");
        player.geometry.flip_x = true;        // Volta il giocatore verso sinistra
        player.geometry.x     -= step_length; // Sposta il giocatore verso a sinistra
        next_animation = "run";
    } 
    if(PP.interactive.kb.is_key_down(s, PP.key_codes.RIGHT) && player.geometry.x <= PP.game.config.canvas_width - player.geometry.display_width) {
        console.log("Pressed right arrow.");
        player.geometry.flip_x = false;        // Volta il giocatore verso destra
        player.geometry.x     += step_length; // Sposta il giocatore verso a destra
        next_animation = "run";
    }

    // salta
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
        if (player.geometry.y > floor_height - max_jump_height)
            player.geometry.y -= jump_size;
        console.log("Pressed spacebar.");
        next_animation = "jump";
    } 
    // controlla la caduta 
    if (PP.interactive.kb.is_key_up(s, PP.key_codes.SPACE) && player.geometry.y <= floor_height) {
        player.geometry.y += jump_size;
        next_animation = "jump";
    }

    // inizializza la prossima animazione
    if (current_animation != next_animation) {
        PP.assets.sprite.animation_play(player, next_animation);
        current_animation = next_animation;
    }
}

function destroy(s) {
    console.log("Executing destroy() - SCENE 7");

}

PP.scenes.add("scene8", preload, create, update, destroy);