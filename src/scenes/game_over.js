let img_bg_gameover;

let img_btn_rigioca;
let img_btn_checkpoint;
let img_btn_menu;

// Variabili per gli oggetti bottone effettivi in scena
let go_btn_rigioca;
let go_btn_checkpoint;
let go_btn_menu;

let go_mouse_lock = false;

const SCALA_BOTTONI = 1.0; 

function preload_game_over(s) {
    img_bg_gameover = PP.assets.image.load(s, "assets/images/TAVOLE/Tavole/Game over.jpg");

    img_btn_rigioca = PP.assets.image.load(s, "assets/images/TAVOLE/Elementi_tavole/pulsante_rigioca_game_over.png");
    img_btn_checkpoint = PP.assets.image.load(s, "assets/images/TAVOLE/Elementi_tavole/pulsante_checkpoint.png");
    img_btn_menu = PP.assets.image.load(s, "assets/images/TAVOLE/Elementi_tavole/pulsante_menu_game_over.png");
}

function create_game_over(s) {
    go_mouse_lock = false;
    let w = PP.game.config.canvas_width;
    let h = PP.game.config.canvas_height;
    let cx = w / 2;

    // 1. SFONDO
    let bg = PP.assets.image.add(s, img_bg_gameover, cx, h / 2, 0.5, 0.5);
    
    // [PHASER] Adatto lo sfondo alle dimensioni del canvas
    bg.geometry.scale_x = w / bg.ph_obj.width;
    bg.geometry.scale_y = h / bg.ph_obj.height;

    // 2. TITOLO
    let titolo = PP.shapes.text_styled_add(s, cx, h / 11, "GAME OVER", 60, "Times New Roman", "bold", "0xC2B280", null, 0.5, 0.5);
    
    // Recupero la causa della morte salvata nel Game State
    let causa_raw = PP.game_state.get_variable("causa_morte");
    let testo_causa = "";

    // Frasi simpatiche alla morte
    if (causa_raw === "suicidio") testo_causa = "L'inquinamento ti si è ritorto contro.";
    else if (causa_raw === "sabbie") testo_causa = "Un po' troppo denso per nuotare?";
    else if (causa_raw === "ragno") testo_causa = "Spuntino per ragni.";
    else if (causa_raw === "cactus_contatto") testo_causa = "Agopuntura estrema.";
    else if (causa_raw === "cactus_proiettile") testo_causa = "Spina nel fianco.";
    else testo_causa = "L'INQUINAMENTO HA VINTO!";

    // Mostro la frase sotto il titolo
    let sottotitolo = PP.shapes.text_styled_add(s, cx, h / 6, testo_causa, 25, "Helvetica", "bold", "0xC2B280", null, 0.5, 0.5);
    
    // [PHASER] Imposto l'allineamento del testo
    sottotitolo.ph_obj.setAlign('center');


    // 3. POSIZIONAMENTO BOTTONI
    let y_btn = h / 1.2; 

    // Bottone Rigioca da capo (Sinistra)
    go_btn_rigioca = PP.assets.image.add(s, img_btn_rigioca, cx - 300, y_btn, 0.5, 0.5);
    go_btn_rigioca.geometry.scale_x = SCALA_BOTTONI;
    go_btn_rigioca.geometry.scale_y = SCALA_BOTTONI; 

    // Bottone Torna al Menu (Destra)
    go_btn_menu = PP.assets.image.add(s, img_btn_menu, cx + 300, y_btn, 0.5, 0.5);
    go_btn_menu.geometry.scale_x = SCALA_BOTTONI;
    go_btn_menu.geometry.scale_y = SCALA_BOTTONI;

    // Bottone Checkpoint (Centro) - Visibile SOLO se ho attivato un checkpoint
    let cp_attivo = PP.game_state.get_variable("checkpoint_attivo");
    if (cp_attivo) {
        go_btn_checkpoint = PP.assets.image.add(s, img_btn_checkpoint, cx, y_btn, 0.5, 0.5);
        go_btn_checkpoint.geometry.scale_x = SCALA_BOTTONI;
        go_btn_checkpoint.geometry.scale_y = SCALA_BOTTONI;
    } else {
        go_btn_checkpoint = null;
    }
}

function update_game_over(s) {
    
    // Funzione helper interna per gestire il click sui bottoni
    let check_click = (btn_pp, action) => {
        if (!btn_pp) return;
        
        // [PHASER] Controllo se il mouse è attivo nella scena
        if (!s.input.activePointer) return;
        
        // [PHASER] Recupero coordinate native del mouse
        let mx = s.input.activePointer.x;
        let my = s.input.activePointer.y;
        let down = s.input.activePointer.isDown;
        
        let b = btn_pp.ph_obj;
        
        // Calcolo manualmente se il mouse è sopra il bottone (Bounding Box)
        // Uso width/height nativi scalati
        let width = b.width * b.scaleX;
        let height = b.height * b.scaleY;

        if (mx > b.x - width/2 && mx < b.x + width/2 && 
            my > b.y - height/2 && my < b.y + height/2) {
            
            // [PHASER] Effetto hover scuro
            b.setTint(0x888888); 
            
            if (down) {
                // Eseguo l'azione solo una volta (lock)
                if (!go_mouse_lock) { go_mouse_lock = true; action(); }
            } else { go_mouse_lock = false; }
        } else {
            // [PHASER] Rimuovo effetto hover
            b.clearTint();
        }
    };

    // Funzione per pulire tutte le variabili globali quando si ricomincia da zero
    let resetta_tutto_a_zero = () => {
        PP.game_state.set_variable("checkpoint_attivo", false);
        PP.game_state.set_variable("ultimo_livello", null);
        PP.game_state.set_variable("cp_x", null);
        PP.game_state.set_variable("cp_y", null);
        PP.game_state.set_variable("HP_player", 10);
        PP.game_state.set_variable("HP_checkpoint", 10);
        PP.game_state.set_variable("arma_sbloccata", false);
        PP.game_state.set_variable("arma_equipaggiata", 0);
        PP.game_state.set_variable("tot_blueprint", 0);
        PP.game_state.set_variable("tot_ingranaggi", 0);
        PP.game_state.set_variable("tot_blueprint_checkpoint", 0);
        PP.game_state.set_variable("tot_ingranaggi_checkpoint", 0);
        PP.game_state.set_variable("collezionabili_presi_checkpoint", []);
        PP.game_state.set_variable("collezionabili_presi_temp", []);
        PP.game_state.set_variable("nemici_uccisi", []);
        
        // Ripristino modalità di sparo default
        if (typeof hud_modalita_inquinante !== 'undefined') {
            hud_modalita_inquinante = true;
        }
    };

    // --- GESTIONE BOTTONI ---
    
    // 1. Rigioca: Azzera tutto e riparte dal livello base
    check_click(go_btn_rigioca, () => {
        resetta_tutto_a_zero();
        PP.scenes.start("base");
    });

    // 2. Checkpoint: Carica l'ultimo livello salvato senza azzerare tutto
    check_click(go_btn_checkpoint, () => {
        let lv_salvato = PP.game_state.get_variable("ultimo_livello") || "base";
        
        // Resetta i collezionabili presi dopo l'ultimo checkpoint
        if (typeof window.resetta_collezionabili_al_respawn === "function") {
            window.resetta_collezionabili_al_respawn();
        }
        PP.scenes.start(lv_salvato);
    });

    // 3. Menu: Azzera tutto e torna al titolo
    check_click(go_btn_menu, () => {
        resetta_tutto_a_zero();
        PP.scenes.start("main_menu");
    });
}

function destroy_game_over(s) {}

PP.scenes.add("game_over", preload_game_over, create_game_over, update_game_over, destroy_game_over);