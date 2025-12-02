const DIMENSIONE_TILE = 32; //grandezza blocchi (da cambiare quando metto quelli più grandi)

const PUNTO_SPAWN = 30; // Numero blocco spawn giocatore 

const BLOCCHI_SOLIDI = [42,43,44,52,53,54]; // Aggiungere qua blocchi solidi con Hitbox



function preload(s) {
    s.load.spritesheet("tiles", "assets/images/DESERTO.png", { frameWidth: 32, frameHeight: 32 });

    if (typeof player_preload === "function") {  // così carico le cose di Eren (dal file player.js)
        player_preload(s);
    }
}



function create(s) {

   

    //Camera edo- non riesco a cambiarla con quella PP
    s.cameras.main.setZoom(2);
    s.cameras.main.setBackgroundColor('#222222'); // Sfondo grigio (temporaneo, prima di mettere gli sfondi in parallasse)


    // Calcolo grandezza mondo:
    // Prendo larghezza e altezza dalla matrice livello_dati.js

    let larghezzaMondo = MATRICE[0].length * DIMENSIONE_TILE; 
    let altezzaMondo = MATRICE.length * DIMENSIONE_TILE; //prende le dimensioni della matrice (numero di "blocchi")e la moltiplica per la dimensione in pixel dei singoli blocchi (cioè 16 pixel (e più avanti sarà 32))


    // Prendo il punto di inizio (perché su Godot ho disegnato non partendo da coordinate 0,0 ma un po' prima)
    let inizioX = OFFSET_X * DIMENSIONE_TILE;
    let inizioY = OFFSET_Y * DIMENSIONE_TILE;

    //Bordi mondo fisica e camera
    s.physics.world.setBounds(inizioX, inizioY, larghezzaMondo, altezzaMondo);
    s.cameras.main.setBounds(inizioX, inizioY, larghezzaMondo, altezzaMondo);
    



    // Da qui si inizia effettivamente a "costruire"
    let gruppoMuri = s.physics.add.staticGroup(); //Variabile per collisioni con elementi statici (Muri, pavaimenti, piattaforme,...)

    // qui viene guardat tutta la griglia dei dati (riga per riga, colonna per colonna)

    for (let y = 0; y < MATRICE.length; y++) { // Scorre le righe dall'alto al basso, una ad una

        // Specifica che deve vederle da sinistra a destra
        for (let x = 0;
            x < MATRICE[y].length; //Continua finché x è minore della larghezza di quella specifica riga
            x++) {

            let id = MATRICE[y][x]; // Qui si chiede quale numero è presente in quella posizione

            if (id === 0) continue; // Se è 0 (quindi vuoto, aria), salto al prossimo, senza stare a perdere tempo a creare cose inutili

            // Calcolo dove va messo questo blocco in pixel
            let posX = (x + OFFSET_X) * DIMENSIONE_TILE; // Dato che ho cominciato a disegnare a x = -25, devo "spostare" tutto di 25 colonne
            let posY = (y + OFFSET_Y) * DIMENSIONE_TILE; // Come sopra


            //1. Se il blocco che sta cercando è il player?? (per ora ho impostato il numero 30)
            if (id === PUNTO_SPAWN) { // Qui viene verificato che il player nasca effettivametne nel punto desiderato 
                
                if (typeof player_create === "function") { //Verifica che esiste la funzione player_create in altri file (player.js)
                    
                    // SALVO LE COORDINATE IN VARIABILI GLOBALI COSÌ PLAYER.JS PUÒ LEGGERLE SENZA PASSARLE COME PARAMETRI
                    PP.game_state.set_variable("spawn_x", posX + 8); // sposto lo spawn di qualche pixel per evitare che si incastri nei blocchi adiacenti
                    PP.game_state.set_variable("spawn_y", posY - 20); // Lo creo un po' più in alto (-20) così non si incastra nel pavimento appena nasce
                   
                
                    player = player_create(s); 

                }
                continue; // Fatto!!! quindi passo al prossimo blocco
            }

            // 2. Se il blocco è un muro solido?
            if (BLOCCHI_SOLIDI.includes(id)) {  // Controllo se il numero è nella mia lista BLOCCHI_SOLIDI

                let muro = gruppoMuri.create(posX, posY, "tiles", // Creo il muro direttamente dentro il gruppo fisico
                    id - 1); // (id - 1 perché Godot conta da 1 ma Phaser da 0)

                // ALLINEAMENTO FONDAMENTALE:
                muro.setOrigin(0, 0); // Va messo perché sennò la hitbox si sballa e alcune tile si spostano di 8 px a destra
                muro.refreshBody(); // Ricalcola subito dove si trova il rettangolo blu
            }
            
            //3. Se il blocco è solamente una decorazione?
            else {
                // Creo solo l'immagine, niente fisica, ci passo attraverso
                let decorazione = s.add.image(posX, posY, "tiles", id - 1);
                decorazione.setOrigin(0, 0);
            }
        }
    }


    gruppoMuri.refresh(); //aggiorno tutti i muri alla fine per assicurarne la corretta posizione



    // Collisioni
    if (player) {
        s.physics.add.collider(player, gruppoMuri); // Controlla costantemente che Eren sbatta contro i muri
        s.cameras.main.startFollow(player); // Dico alla telecamera di seguire Eren ovunque vada // Dico alla telecamera di seguire Eren ovunque vada
        
    }
}

function update(s) {
    // let player = PP.game_state.get_variable("player"); // Recupero Eren dalla memoria (prima l'ho salvato come "player")

    // Se Eren esiste, gli dico di muoversi (usando il codice in player.js)
    if (typeof player_update === "function") {
        player_update(s);
    }
}

// DETTAGLI delle scene
PP.scenes.add("Livello1", preload, create, update, function () { });
PP.game.create({
    canvas_width: 1280,
    canvas_height: 800,
    canvas_id: "game_div",
    background_color: 0x333333,
    debug_mode: true, // lo posso mettere "false" quando finisco di testare le hitbox blu

    gravity_value: 0 //Non capisco perché quavndo lo tolgo da qua (anche se vale 0) non funziona il gioco
});