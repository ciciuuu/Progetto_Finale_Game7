let img_mushroom_1;
let img_mushroom_2;

function preload_mushrooms(s) {
    // Load delle immagini del funghetto
    img_mushroom_1   = PP.assets.image.load(s, "assets/images/mushroom_1.png");
    img_mushroom_2   = PP.assets.image.load(s, "assets/images/mushroom_2.png");
}

let mushroom_x;
let mushroom_y;

let p;

function create_mushroom(s) {
    let mush_img;
    // Scelgo casualmnte (con una probabilita' del 50%)
    // quale immagine del funghetto utilizzare
    if(Math.random() < 0.5) {
        mush_img = img_mushroom_1;
    } else {
        mush_img = img_mushroom_2;
    }
    let mushroom = PP.assets.image.add(s, mush_img, mushroom_x, mushroom_y, 0, 0);
    PP.physics.add(s, mushroom, PP.physics.type.STATIC);
    PP.physics.add_overlap_f(s, p, mushroom, collision_mushroom);
}

function collision_mushroom(s, player, mushroom) {
    // In caso di collisione distruggo il funghetto
    let i = PP.game_state.get_variable("mushrooms");
    PP.game_state.set_variable("mushrooms", i + 1);

    mushroom_x = mushroom.geometry.x;
    mushroom_y = mushroom.geometry.y;
    p = player;

    PP.assets.destroy(mushroom);
    console.log(PP.game_state.get_variable("mushrooms"));
    PP.timers.add_timer(s, 500, create_mushroom, false);
}

function create_mushrooms(s, player) {

    // Creazione di 10 funghetti
    for (let i=0; i<10; i++) {

        let mush_img;
        // Scelgo casualmnte (con una probabilita' del 50%)
        // quale immagine del funghetto utilizzare
        if(Math.random() < 0.5) {
            mush_img = img_mushroom_1;
        } else {
            mush_img = img_mushroom_2;
        }
        
        // Ora creo il singolo funghetto, lo aggiungo alla fisica e imposto la funzione
        // di collisione
        let mushroom = PP.assets.image.add(s, mush_img, 300+200*i, 580, 0, 0);
        PP.physics.add(s, mushroom, PP.physics.type.STATIC);
        PP.physics.add_overlap_f(s, player, mushroom, collision_mushroom);
    }


}

function update_mushrooms(s) {
    // Nothing to do...
}
