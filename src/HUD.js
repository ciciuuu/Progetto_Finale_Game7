// HUD.js

let asset_ingranaggio_0;
let asset_ingranaggio_1;
let asset_ingranaggio_2;
let asset_ingranaggio_3;
let ingranaggio;

let asset_blueprint;
let blueprint;

let asset_pistola;
let pistola;

function preload_hud(s) {
    //HUD
    //ingranaggio
    asset_ingranaggio_0 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/0_ingranaggio.png");
    asset_ingranaggio_1 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/1_ingranaggio.png");
    asset_ingranaggio_2 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/2_ingranaggio.png");
    asset_ingranaggio_3 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/3_ingranaggio.png");

    //blueprint
    asset_blueprint = PP.assets.image.load(s, "assets/images/HUD/Blueprint/BP_boh.png");

    //pistola
    asset_pistola = PP.assets.image.load(s, "assets/images/HUD/Pistola/Pistola_buona.png");
}

function create_hud(s) {
    // 6. HUD
    //ingranaggio
    ingranaggio = PP.assets.image.add(s, asset_ingranaggio_0, 885, 210, 0, 0, 0, 0);
    ingranaggio.ph_obj.setScrollFactor(0); // Rimane fisso sullo schermo
    
    //Blueprint
    blueprint = PP.assets.image.add(s, asset_blueprint, 885, 255, 0, 0, 0, 0);
    blueprint.ph_obj.setScrollFactor(0); // Rimane fisso sullo schermo
    
    //Pistola
    pistola = PP.assets.image.add(s, asset_pistola, 332, 210, 0, 0, 0, 0);
    pistola.ph_obj.setScrollFactor(0); // Rimane fisso sullo schermo
}

function update_hud(s) {
    // Qui puoi mettere la logica per cambiare l'ingranaggio se serve
    /* if (ingranaggio_coll = 1){
         asset_ingranaggio_0 = asset_ingranaggio_1
     } */
}

function destroy_hud(s){

}