let asset_ingranaggio_0;
// let asset_ingranaggio_1;
// let asset_ingranaggio_2;
// let asset_ingranaggio_3;

//let obj_ingranaggio_0;
// let obj_ingranaggio_1;
// let obj_ingranaggio_2;
// let obj_ingranaggio_3;

//CONVIENE FARE UNA TILESHEET E FACCIAMO ANDARE AVANTI LO SPRITE OGNI 
//VOLTA CHE PRENDE UN COLLEZIONABILE

let ingranaggio;

function preload(s) {
  asset_ingranaggio_0 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/0_ingranaggio.png");
  // asset_ingranaggio_1 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/1_ingranaggio.png
  // asset_ingranaggio_2 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/2_ingranaggio.png");
  // asset_ingranaggio_3 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/3_ingranaggio.png");
}

function create(s) {
  ingranaggio = PP.assets.image.add(s, asset_ingranaggio_0, 20, 20, 50, 50, 0, 0);
  ingranaggio.ph_obj.setScrollFactor(0);


}

function update(s) {

}

function destroy(s) {

}