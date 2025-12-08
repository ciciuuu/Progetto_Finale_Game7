let img_player;

let player;
let txt_mushrooms;
let muri_livello; // Variabile per ricevere i muri da Godot

function preload(s) {
    console.log("Executing preload() - SCENE");

    // 1. CARICAMENTO TILESET DI GODOT (CHIAMATA CRITICA)
    if (window.godot_preload) {
        window.godot_preload(s);
    }

    // Caricamento asset standard
    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/Personaggio 52x52.png", 52, 52);

    preload_player(s);
}


function create(s) {
    console.log("Executing create() - SCENE");

    //ZOOM IN PHASER
    s.cameras.main.setZoom(2);
    // 2. COSTRUIONE MAPPA
    // Eseguiamo la creazione e salviamo il gruppo di muri restituito
    if (window.godot_create) {
        muri_livello = window.godot_create(s);
    }

    // 3. RECUPERO SPAWN POINT E CREAZIONE PLAYER
    let startX = PP.game_state.get_variable("spawn_x") || 150;
    let startY = PP.game_state.get_variable("spawn_y") || 620;

    player = PP.assets.sprite.add(s, img_player, startX, startY, 0.5, 1);
    PP.physics.add(s, player, PP.physics.type.DYNAMIC);

    // *** RISOLUZIONE CONFLITTI VECCHI ***
    // Rimuoviamo il pavimento fisso e il suo collider manuale
    // floor = PP.shapes.rectangle_add(...);
    // PP.physics.add(s, floor, PP.physics.type.STATIC); 
    // PP.physics.add_collider(s, player, floor);
    s.physics.world.TILE_BIAS = 32;
    // 4. COLLISIONI: Player contro i Muri di Godot
    if (muri_livello) {
        // [PHASER NATIVO] Colleghiamo il player nativo (.ph_obj) al gruppo di muri
        s.physics.add.collider(player.ph_obj, muri_livello);
    }

    configure_player_animations(s, player);

    // 5. CAMERA
    PP.camera.start_follow(s, player, 0, 75);
    // Nota: La telecamera segue il player nativo, quindi .ph_obj non è necessario qui
    // ma la telecamera usa i bordi che sono stati impostati in godot_create.

    txt_mushrooms = PP.shapes.text_add(s, 50, 50, "Mushrooms: " + (PP.game_state.get_variable("mushrooms") || 0));
    txt_mushrooms.ph_obj.setScrollFactor(0); // Fissa l'HUD alla camera

}

// ... resto del codice ...
function update(s) {
    if (player) manage_player_update(s, player);

    let mushrooms = PP.game_state.get_variable("mushrooms") || 0;
    PP.shapes.text_change(txt_mushrooms, "Mushrooms: " + mushrooms);
}

function destroy(s) { }

PP.scenes.add("base", preload, create, update, destroy);