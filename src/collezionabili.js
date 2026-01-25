let img_blueprint;
let img_cuore;
let img_ingranaggio;

// Variabile globale per contare quanti ne hai presi
let contatore_raccolti = 0; 

function preload_blueprint(s) {
  // Load dell'immagine del blueprint
  img_blueprint = PP.assets.image.load(s, "assets/images/COLLEZIONABILI/Blueprint_coll.png");

  img_cuore = PP.assets.image.load(s, "assets/images/COLLEZIONABILI/Cuore.png");

  img_ingranaggio = PP.assets.image.load(s, "assets/images/COLLEZIONABILI/Ingranaggio.png");
}

function collision_blueprint(s, player, blueprint_collezionabile) {
  // Aumento il contatore di 1
  contatore_raccolti = contatore_raccolti + 1;

  // Scrivo in console quale numero ho preso
  console.log("collezionabile " + contatore_raccolti + " preso");

  // In caso di collisione distruggo il blueprint
  PP.assets.destroy(blueprint_collezionabile);
}

function create_blueprint(s, player) {

  // Creo l'oggetto usando l'immagine caricata
  let blueprint_collezionabile = PP.assets.image.add(s, img_blueprint, 100, -100, 0.5, 0.5);

  let blueprint_collezionabile1 = PP.assets.image.add(s, img_blueprint, 3684, 29, 0.5, 0.5);

  let blueprint_collezionabile2 = PP.assets.image.add(s, img_blueprint, 200, -100, 0.5, 0.5);

  let blueprint_collezionabile3 = PP.assets.image.add(s, img_blueprint, 1820, -165, 0.5, 0.5);


  // Aggiungo la fisica (STATICA, così non cade e non viene spinto)
  PP.physics.add(s, blueprint_collezionabile, PP.physics.type.STATIC);
  PP.physics.add(s, blueprint_collezionabile1, PP.physics.type.STATIC);
  PP.physics.add(s, blueprint_collezionabile2, PP.physics.type.STATIC);
  PP.physics.add(s, blueprint_collezionabile3, PP.physics.type.STATIC);

  // Imposto la collisione (Overlap) tra player e blueprint
  PP.physics.add_overlap_f(s, player, blueprint_collezionabile, collision_blueprint);
  PP.physics.add_overlap_f(s, player, blueprint_collezionabile1, collision_blueprint);
  PP.physics.add_overlap_f(s, player, blueprint_collezionabile2, collision_blueprint);
  PP.physics.add_overlap_f(s, player, blueprint_collezionabile3, collision_blueprint);
}

function update_blueprint(s) {

}