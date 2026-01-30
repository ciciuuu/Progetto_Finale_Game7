let img_bg_gameover;

// Variabili immagini bottoni
let img_btn_rigioca;
let img_btn_checkpoint;
let img_btn_menu;

// Oggetti bottoni scena
let go_btn_rigioca;
let go_btn_checkpoint;
let go_btn_menu;

let go_mouse_lock = false;

// --- IMPOSTAZIONI GRAFICHE ---
const SCALA_BOTTONI = 1.0; // Cambia questo valore (es. 0.8 o 1.2) per ridimensionare senza distorcere

function preload_game_over(s) {
    img_bg_gameover = PP.assets.image.load(s, "assets/images/TAVOLE/Tavole/Game over.jpg");

    // --- CARICAMENTO BOTTONI SPECIFICI ---
    // Assicurati che i nomi dei file siano esattamente questi nella cartella
    img_btn_rigioca = PP.assets.image.load(s, "assets/images/TAVOLE/Elementi tavole/pulsante rigioca_game_over.png");
    img_btn_checkpoint = PP.assets.image.load(s, "assets/images/TAVOLE/Elementi tavole/pulsante checkpoint.png");
    img_btn_menu = PP.assets.image.load(s, "assets/images/TAVOLE/Elementi tavole/pulsante menu_game_over.png");
}

function create_game_over(s) {
    go_mouse_lock = false;
    let w = PP.game.config.canvas_width;
    let h = PP.game.config.canvas_height;
    let cx = w / 2;

    // 1. SFONDO
    let bg = PP.assets.image.add(s, img_bg_gameover, cx, h / 2, 0.5, 0.5);
    // Adatta lo sfondo
    bg.geometry.scale_x = w / bg.ph_obj.width;
    bg.geometry.scale_y = h / bg.ph_obj.height;

    // 2. TITOLO E SOTTOTITOLO (Causa morte)
    let titolo = PP.shapes.text_styled_add(s, cx, h / 4, "GAME OVER", 60, "Helvetica", "bold", "0xFFFFFF", null, 0.5, 0.5);
    
    let causa_raw = PP.game_state.get_variable("causa_morte");
    let testo_causa = "";

    if (causa_raw === "suicidio") testo_causa = "L'inquinamento ti si è ritorto contro.";
    else if (causa_raw === "sabbie") testo_causa = "Un po' troppo denso per nuotare?";
    else if (causa_raw === "ragno") testo_causa = "Spuntino per ragni.";
    else if (causa_raw === "cactus_contatto") testo_causa = "Agopuntura estrema.";
    else if (causa_raw === "cactus_proiettile") testo_causa = "Spina nel fianco.";
    else testo_causa = "L'INQUINAMENTO HA VINTO!";

    let sottotitolo = PP.shapes.text_styled_add(s, cx, h / 2.5, testo_causa, 40, "Helvetica", "bold", "0xFFFFFF", null, 0.5, 0.5);
    sottotitolo.ph_obj.setAlign('center');


    // 3. POSIZIONAMENTO BOTTONI
    // Altezza bottoni
    let y_btn = h / 1.2; 

    // --- BOTTONE RIGIOCA (Sinistra) ---
    go_btn_rigioca = PP.assets.image.add(s, img_btn_rigioca, cx - 300, y_btn, 0.5, 0.5);
    go_btn_rigioca.geometry.scale_x = SCALA_BOTTONI;
    go_btn_rigioca.geometry.scale_y = SCALA_BOTTONI; // Scala uguale per non distorcere

    // --- BOTTONE MENU (Destra) ---
    go_btn_menu = PP.assets.image.add(s, img_btn_menu, cx + 300, y_btn, 0.5, 0.5);
    go_btn_menu.geometry.scale_x = SCALA_BOTTONI;
    go_btn_menu.geometry.scale_y = SCALA_BOTTONI;

    // --- BOTTONE CHECKPOINT (Centro - Solo se attivo) ---
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
    
    // Funzione helper per gestire il click
    let check_click = (btn_pp, action) => {
        if (!btn_pp) return;
        if (!s.input.activePointer) return;
        
        let mx = s.input.activePointer.x;
        let my = s.input.activePointer.y;
        let down = s.input.activePointer.isDown;
        
        let b = btn_pp.ph_obj;
        
        // Calcolo area click basato sulla scala
        let width = b.width * b.scaleX;
        let height = b.height * b.scaleY;

        if (mx > b.x - width/2 && mx < b.x + width/2 && 
            my > b.y - height/2 && my < b.y + height/2) {
            
            b.setTint(0x888888); // Effetto hover scuro
            if (down) {
                if (!go_mouse_lock) { go_mouse_lock = true; action(); }
            } else { go_mouse_lock = false; }
        } else {
            b.clearTint();
        }
    };

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
        if (typeof hud_modalita_inquinante !== 'undefined') {
            hud_modalita_inquinante = true;
        }
    };

    // AZIONI BOTTONI
    
    // 1. Rigioca
    check_click(go_btn_rigioca, () => {
        resetta_tutto_a_zero();
        PP.scenes.start("base");
    });

    // 2. Checkpoint
    check_click(go_btn_checkpoint, () => {
        let lv_salvato = PP.game_state.get_variable("ultimo_livello") || "base";
        if (typeof window.resetta_collezionabili_al_respawn === "function") {
            window.resetta_collezionabili_al_respawn();
        }
        PP.scenes.start(lv_salvato);
    });

    // 3. Menu
    check_click(go_btn_menu, () => {
        resetta_tutto_a_zero();
        PP.scenes.start("main_menu");
    });
}

function destroy_game_over(s) {}

PP.scenes.add("game_over", preload_game_over, create_game_over, update_game_over, destroy_game_over);