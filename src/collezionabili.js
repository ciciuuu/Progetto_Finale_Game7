let img_blueprint_item; // Variabile per l'immagine caricata

function preload_blueprint(s) {
    // Load dell'immagine del blueprint
    img_blueprint_item = PP.assets.image.load(s, "assets/images/HUD/Blueprint/BP_boh.png");
}

function collision_blueprint(s, player, blueprint_collezionabile) {
    // In caso di collisione distruggo il blueprint
    PP.assets.destroy(blueprint_collezionabile);
    console.log("Blueprint raccolto!");
}

function create_blueprint(s, player) {

    // Creo l'oggetto usando l'immagine caricata
    let blueprint_collezionabile = PP.assets.image.add(s, img_blueprint_item, -200, -50, 0, 0);
    
    
    // Aggiungo la fisica (STATICA, così non cade e non viene spinto)
    PP.physics.add(s, blueprint_collezionabile, PP.physics.type.STATIC);
    
    // Imposto la collisione (Overlap) tra player e blueprint
    PP.physics.add_overlap_f(s, player, blueprint_collezionabile, collision_blueprint);
}

function update_blueprint(s) {

}



/* function preload_collezionabile(s) {
  blueprint_collezionabile = PP.assets.image.load(s, "assets/images/HUD/PLAYER/player.png");


}

function create_collezionabile(s) {
  blueprint_1 = PP.assets.image.add(s, blueprint_collezionabile, -200, -200, 0.5, 1);

}




function update_collezionabile(s) {

}

function destroy_collezionabile(s) {

} */