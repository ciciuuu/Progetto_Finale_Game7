// PARAMETRI (mettiamoli tutti quanti qua per poterli modificare facilmente)
const VELOCITA = 200;
const SALTO = 750;
const DOPPIO_SALTO = 0;
const GRAVITA = 2750; //gravità solo player (c'è anche in livello_prova ma non so come toglierla da lì :(  )


function player_preload(s) {
    s.load.image("player", "assets/images/Eren.png"); // ho messo il "soprannome" player, così ci è più comodo richiamarlo dopo
}


function player_create(s) {
    
    let x = PP.game_state.get_variable("spawn_x") || 0; 
    let y = PP.game_state.get_variable("spawn_y") || 0;

    let fisica = s.physics.add.sprite(x, y, "player");

    // Fisica
    fisica.setCollideWorldBounds(true); 
    fisica.setGravityY(GRAVITA); //Csotante locale
    

    // HITBOX
    let w = fisica.width;
    let h = fisica.height;
    
    // Stringo la larghezza di 0.5 per evitare che le spalle tocchino i muri
    fisica.body.setSize(w * 0.5, h * 1); 
    fisica.body.setOffset(w * 0.3, h * 0.05); // Centrato

    
    PP.game_state.set_variable("player", fisica); // Qui salvo il player nello stato globale, almeno non deve farlo il livello

    return fisica;
}

// 3. UPDATE
function player_update(s) {
    
    let player = PP.game_state.get_variable("player"); //Recupero il player dalla memoria

    if (!player || !player.body) return;

    let cursors = s.input.keyboard.createCursorKeys();
    let keys = s.input.keyboard.addKeys('W,A,S,D');
    
    // STATO CONTATTO
    // blocked = collisione con muri statici (quelli della mappa)
    let aTerra = player.body.blocked.down;
    let toccaSinistra = player.body.blocked.left;
    let toccaDestra = player.body.blocked.right;

    // MOVIMENTO
    
    // SINISTRA
    if (cursors.left.isDown || keys.A.isDown) {
        player.setFlipX(false); 
        
        //Da rivedere !!
        if (toccaSinistra && !aTerra) {
            player.setVelocityX(0); 
        } else {
            player.setVelocityX(-VELOCITA);
        }
    } 

    //  DESTRA
    else if (cursors.right.isDown || keys.D.isDown) {
        player.setFlipX(true); 
        
        if (toccaDestra && !aTerra) {
            player.setVelocityX(0);
        } else {
            player.setVelocityX(VELOCITA);
        }
    } 

    // Da FErmo
    else {
        player.setVelocityX(0);
    }

    // SALTO
    // Salta solo se i piedi toccano terra
    if ((cursors.up.isDown || keys.W.isDown || cursors.space.isDown) && aTerra) {
        player.setVelocityY(-SALTO);
    }
}

// 4. DESTROY
function player_destroy(s) {
    let player = PP.game_state.get_variable("player");
    if (player) player.destroy();
}