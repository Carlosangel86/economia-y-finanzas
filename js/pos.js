// ===== MÓDULO DE PUNTO DE VENTA (POS), CATÁLOGO & ESTADÍSTICAS =====

// ===== POS MODULE =====
const REFACCIONES_CATALOG = [
    {
        "id": "ref_1",
        "name": "Pistón",
        "category": "Motor",
        "cost": 350,
        "price": 480,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/1_pist_n.jpg"
    },
    {
        "id": "ref_2",
        "name": "Anillos de pistón",
        "category": "Motor",
        "cost": 150,
        "price": 220,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/2_anillos_de_pist_n.jpg"
    },
    {
        "id": "ref_3",
        "name": "Biela",
        "category": "Motor",
        "cost": 400,
        "price": 550,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/3_biela.png"
    },
    {
        "id": "ref_4",
        "name": "Cigüeñal",
        "category": "Motor",
        "cost": 2500,
        "price": 3200,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/4_cig_e_al.jpg"
    },
    {
        "id": "ref_5",
        "name": "Árbol de levas",
        "category": "Motor",
        "cost": 1200,
        "price": 1600,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/5__rbol_de_levas.jpg"
    },
    {
        "id": "ref_6",
        "name": "Válvula de admisión",
        "category": "Motor",
        "cost": 80,
        "price": 120,
        "stock": 35,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/6_v_lvula_de_admisi_n.jpeg"
    },
    {
        "id": "ref_7",
        "name": "Válvula de escape",
        "category": "Motor",
        "cost": 90,
        "price": 135,
        "stock": 35,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/7_v_lvula_de_escape.png"
    },
    {
        "id": "ref_8",
        "name": "Culata (Cabeza del motor)",
        "category": "Motor",
        "cost": 3500,
        "price": 4800,
        "stock": 4,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/8_culata__cabeza_del_motor_.jpg"
    },
    {
        "id": "ref_9",
        "name": "Junta de culata",
        "category": "Motor",
        "cost": 200,
        "price": 350,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/9_junta_de_culata.jpg"
    },
    {
        "id": "ref_10",
        "name": "Bloque del motor",
        "category": "Motor",
        "cost": 8000,
        "price": 11000,
        "stock": 0,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/10_bloque_del_motor.jpg"
    },
    {
        "id": "ref_11",
        "name": "Cárter",
        "category": "Motor",
        "cost": 600,
        "price": 850,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/11_c_rter.jpg"
    },
    {
        "id": "ref_12",
        "name": "Bomba de aceite",
        "category": "Motor",
        "cost": 450,
        "price": 650,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/12_bomba_de_aceite.png"
    },
    {
        "id": "ref_13",
        "name": "Filtro de aceite",
        "category": "Motor",
        "cost": 60,
        "price": 95,
        "stock": 35,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/13_filtro_de_aceite.jpg"
    },
    {
        "id": "ref_14",
        "name": "Bomba de agua",
        "category": "Motor",
        "cost": 380,
        "price": 550,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/14_bomba_de_agua.png"
    },
    {
        "id": "ref_15",
        "name": "Radiador",
        "category": "Motor",
        "cost": 1200,
        "price": 1700,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/15_radiador.png"
    },
    {
        "id": "ref_16",
        "name": "Termostato",
        "category": "Motor",
        "cost": 150,
        "price": 250,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/16_termostato.jpg"
    },
    {
        "id": "ref_17",
        "name": "Ventilador del radiador",
        "category": "Motor",
        "cost": 500,
        "price": 750,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/17_ventilador_del_radiador.jpeg"
    },
    {
        "id": "ref_18",
        "name": "Banda de distribución",
        "category": "Motor",
        "cost": 250,
        "price": 400,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/18_banda_de_distribuci_n.jpeg"
    },
    {
        "id": "ref_19",
        "name": "Cadena de distribución",
        "category": "Motor",
        "cost": 450,
        "price": 680,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/19_cadena_de_distribuci_n.jpg"
    },
    {
        "id": "ref_20",
        "name": "Tensor de distribución",
        "category": "Motor",
        "cost": 300,
        "price": 450,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/20_tensor_de_distribuci_n.jpg"
    },
    {
        "id": "ref_21",
        "name": "Carburador",
        "category": "Motor",
        "cost": 800,
        "price": 1150,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/21_carburador.webp"
    },
    {
        "id": "ref_22",
        "name": "Inyector de combustible",
        "category": "Motor",
        "cost": 350,
        "price": 500,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/22_inyector_de_combustible.webp"
    },
    {
        "id": "ref_23",
        "name": "Riel de inyectores",
        "category": "Motor",
        "cost": 600,
        "price": 850,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/23_riel_de_inyectores.jpg"
    },
    {
        "id": "ref_24",
        "name": "Bomba de combustible",
        "category": "Motor",
        "cost": 550,
        "price": 800,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/24_bomba_de_combustible.jpg"
    },
    {
        "id": "ref_25",
        "name": "Filtro de combustible",
        "category": "Motor",
        "cost": 80,
        "price": 130,
        "stock": 35,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/25_filtro_de_combustible.jpg"
    },
    {
        "id": "ref_26",
        "name": "Disco de embrague (Clutch)",
        "category": "Transmisión",
        "cost": 450,
        "price": 650,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/26_disco_de_embrague__clutch_.jpg"
    },
    {
        "id": "ref_27",
        "name": "Plato de presión",
        "category": "Transmisión",
        "cost": 500,
        "price": 750,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/27_plato_de_presi_n.jpg"
    },
    {
        "id": "ref_28",
        "name": "Collarín de embrague",
        "category": "Transmisión",
        "cost": 250,
        "price": 380,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/28_collar_n_de_embrague.jpg"
    },
    {
        "id": "ref_29",
        "name": "Cable de embrague",
        "category": "Transmisión",
        "cost": 120,
        "price": 190,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/29_cable_de_embrague.webp"
    },
    {
        "id": "ref_30",
        "name": "Cilindro maestro de embrague",
        "category": "Transmisión",
        "cost": 380,
        "price": 550,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/30_cilindro_maestro_de_embrague.png"
    },
    {
        "id": "ref_31",
        "name": "Caja de cambios",
        "category": "Transmisión",
        "cost": 6000,
        "price": 8500,
        "stock": 2,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/31_caja_de_cambios.jpg"
    },
    {
        "id": "ref_32",
        "name": "Engranajes de transmisión",
        "category": "Transmisión",
        "cost": 800,
        "price": 1200,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/32_engranajes_de_transmisi_n.jpg"
    },
    {
        "id": "ref_33",
        "name": "Sincronizador",
        "category": "Transmisión",
        "cost": 250,
        "price": 400,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/33_sincronizador.jpg"
    },
    {
        "id": "ref_34",
        "name": "Árbol de transmisión (Cardán)",
        "category": "Transmisión",
        "cost": 1800,
        "price": 2500,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/34__rbol_de_transmisi_n__card_n_.jpg"
    },
    {
        "id": "ref_35",
        "name": "Diferencial",
        "category": "Transmisión",
        "cost": 3500,
        "price": 4800,
        "stock": 4,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/35_diferencial.jpg"
    },
    {
        "id": "ref_36",
        "name": "Eje (Palier)",
        "category": "Transmisión",
        "cost": 900,
        "price": 1300,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/36_eje__palier_.webp"
    },
    {
        "id": "ref_37",
        "name": "Junta homocinética",
        "category": "Transmisión",
        "cost": 450,
        "price": 680,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/37_junta_homocin_tica.jpg"
    },
    {
        "id": "ref_38",
        "name": "Cadena de transmisión (Motos)",
        "category": "Transmisión",
        "cost": 300,
        "price": 480,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/38_cadena_de_transmisi_n__motos_.jpg"
    },
    {
        "id": "ref_39",
        "name": "Piñón (Motos)",
        "category": "Transmisión",
        "cost": 150,
        "price": 250,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/39_pi__n__motos_.webp"
    },
    {
        "id": "ref_40",
        "name": "Corona / Sprocket (Motos)",
        "category": "Transmisión",
        "cost": 280,
        "price": 420,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/40_corona___sprocket__motos_.jpg"
    },
    {
        "id": "ref_41",
        "name": "Pastillas de freno (Balatas)",
        "category": "Frenos",
        "cost": 220,
        "price": 350,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/41_pastillas_de_freno__balatas_.jpg"
    },
    {
        "id": "ref_42",
        "name": "Disco de freno",
        "category": "Frenos",
        "cost": 400,
        "price": 600,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/42_disco_de_freno.jpg"
    },
    {
        "id": "ref_43",
        "name": "Tambor de freno",
        "category": "Frenos",
        "cost": 350,
        "price": 520,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/43_tambor_de_freno.jpg"
    },
    {
        "id": "ref_44",
        "name": "Zapatas de freno",
        "category": "Frenos",
        "cost": 180,
        "price": 280,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/44_zapatas_de_freno.jpg"
    },
    {
        "id": "ref_45",
        "name": "Caliper (Mordaza)",
        "category": "Frenos",
        "cost": 650,
        "price": 900,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/45_caliper__mordaza_.jpg"
    },
    {
        "id": "ref_46",
        "name": "Cilindro maestro de frenos",
        "category": "Frenos",
        "cost": 450,
        "price": 650,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/46_cilindro_maestro_de_frenos.webp"
    },
    {
        "id": "ref_47",
        "name": "Líneas de freno (Latiguillos)",
        "category": "Frenos",
        "cost": 150,
        "price": 250,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/47_l_neas_de_freno__latiguillos_.jpg"
    },
    {
        "id": "ref_48",
        "name": "Servofreno (Booster)",
        "category": "Frenos",
        "cost": 1200,
        "price": 1800,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/48_servofreno__booster_.webp"
    },
    {
        "id": "ref_49",
        "name": "Módulo ABS",
        "category": "Frenos",
        "cost": 4500,
        "price": 6200,
        "stock": 0,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/49_m_dulo_abs.jpg"
    },
    {
        "id": "ref_50",
        "name": "Sensor de velocidad ABS",
        "category": "Frenos",
        "cost": 350,
        "price": 550,
        "stock": 0,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/50_sensor_de_velocidad_abs.jpg"
    },
    {
        "id": "ref_51",
        "name": "Pedal de freno",
        "category": "Frenos",
        "cost": 250,
        "price": 400,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/51_pedal_de_freno.jpg"
    },
    {
        "id": "ref_52",
        "name": "Manija de freno (Motos)",
        "category": "Frenos",
        "cost": 80,
        "price": 150,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/52_manija_de_freno__motos_.jpeg"
    },
    {
        "id": "ref_53",
        "name": "Cable de freno",
        "category": "Frenos",
        "cost": 90,
        "price": 160,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/53_cable_de_freno.webp"
    },
    {
        "id": "ref_54",
        "name": "Purgador de freno",
        "category": "Frenos",
        "cost": 20,
        "price": 45,
        "stock": 35,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/54_purgador_de_freno.jpg"
    },
    {
        "id": "ref_55",
        "name": "Amortiguador delantero",
        "category": "Suspensión/Dirección",
        "cost": 650,
        "price": 950,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/55_amortiguador_delantero.jpg"
    },
    {
        "id": "ref_56",
        "name": "Amortiguador trasero",
        "category": "Suspensión/Dirección",
        "cost": 550,
        "price": 850,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/56_amortiguador_trasero.jpg"
    },
    {
        "id": "ref_57",
        "name": "Resorte helicoidal (Muelle)",
        "category": "Suspensión/Dirección",
        "cost": 350,
        "price": 550,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/57_resorte_helicoidal__muelle_.jpg"
    },
    {
        "id": "ref_58",
        "name": "Horquilla de suspensión",
        "category": "Suspensión/Dirección",
        "cost": 480,
        "price": 720,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/58_horquilla_de_suspensi_n.jpg"
    },
    {
        "id": "ref_59",
        "name": "Rótula",
        "category": "Suspensión/Dirección",
        "cost": 180,
        "price": 290,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/59_r_tula.jpg"
    },
    {
        "id": "ref_60",
        "name": "Buje de suspensión",
        "category": "Suspensión/Dirección",
        "cost": 80,
        "price": 140,
        "stock": 35,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/60_buje_de_suspensi_n.jpg"
    },
    {
        "id": "ref_61",
        "name": "Barra estabilizadora",
        "category": "Suspensión/Dirección",
        "cost": 450,
        "price": 680,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/61_barra_estabilizadora.jpg"
    },
    {
        "id": "ref_62",
        "name": "Bieleta",
        "category": "Suspensión/Dirección",
        "cost": 150,
        "price": 260,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/62_bieleta.jpg"
    },
    {
        "id": "ref_63",
        "name": "Cremallera de dirección",
        "category": "Suspensión/Dirección",
        "cost": 2200,
        "price": 3100,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/63_cremallera_de_direcci_n.jpg"
    },
    {
        "id": "ref_64",
        "name": "Bomba de dirección hidráulica",
        "category": "Suspensión/Dirección",
        "cost": 1100,
        "price": 1600,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/64_bomba_de_direcci_n_hidr_ulica.jpg"
    },
    {
        "id": "ref_65",
        "name": "Terminal de dirección",
        "category": "Suspensión/Dirección",
        "cost": 160,
        "price": 250,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/65_terminal_de_direcci_n.jpg"
    },
    {
        "id": "ref_66",
        "name": "Columna de dirección",
        "category": "Suspensión/Dirección",
        "cost": 1500,
        "price": 2200,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/66_columna_de_direcci_n.jpg"
    },
    {
        "id": "ref_67",
        "name": "Volante",
        "category": "Suspensión/Dirección",
        "cost": 800,
        "price": 1300,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/67_volante.jpg"
    },
    {
        "id": "ref_68",
        "name": "Manillar (Motos)",
        "category": "Suspensión/Dirección",
        "cost": 350,
        "price": 550,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/68_manillar__motos_.jpg"
    },
    {
        "id": "ref_69",
        "name": "Telescopios de suspensión (Motos)",
        "category": "Suspensión/Dirección",
        "cost": 1200,
        "price": 1800,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/69_telescopios_de_suspensi_n__motos_.jpg"
    },
    {
        "id": "ref_70",
        "name": "Balero de rueda (Rodamiento)",
        "category": "Suspensión/Dirección",
        "cost": 220,
        "price": 350,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/70_balero_de_rueda__rodamiento_.jpg"
    },
    {
        "id": "ref_71",
        "name": "Batería",
        "category": "Sistema Eléctrico",
        "cost": 1100,
        "price": 1650,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/71_bater_a.jpg"
    },
    {
        "id": "ref_72",
        "name": "Alternador",
        "category": "Sistema Eléctrico",
        "cost": 1800,
        "price": 2600,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/72_alternador.png"
    },
    {
        "id": "ref_73",
        "name": "Estator (Motos)",
        "category": "Sistema Eléctrico",
        "cost": 450,
        "price": 700,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/73_estator__motos_.jpg"
    },
    {
        "id": "ref_74",
        "name": "Motor de arranque (Marcha)",
        "category": "Sistema Eléctrico",
        "cost": 1200,
        "price": 1750,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/74_motor_de_arranque__marcha_.jpg"
    },
    {
        "id": "ref_75",
        "name": "Bujía",
        "category": "Sistema Eléctrico",
        "cost": 40,
        "price": 75,
        "stock": 35,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/75_buj_a.png"
    },
    {
        "id": "ref_76",
        "name": "Bobina de encendido",
        "category": "Sistema Eléctrico",
        "cost": 350,
        "price": 550,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/76_bobina_de_encendido.jpg"
    },
    {
        "id": "ref_77",
        "name": "Cables de bujía",
        "category": "Sistema Eléctrico",
        "cost": 220,
        "price": 380,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/77_cables_de_buj_a.jpg"
    },
    {
        "id": "ref_78",
        "name": "Módulo de control del motor (ECU)",
        "category": "Sistema Eléctrico",
        "cost": 3500,
        "price": 5200,
        "stock": 4,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/78_m_dulo_de_control_del_motor__ecu_.png"
    },
    {
        "id": "ref_79",
        "name": "Caja de fusibles",
        "category": "Sistema Eléctrico",
        "cost": 450,
        "price": 700,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/79_caja_de_fusibles.jpg"
    },
    {
        "id": "ref_80",
        "name": "Relé (Relay)",
        "category": "Sistema Eléctrico",
        "cost": 60,
        "price": 110,
        "stock": 35,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/80_rel___relay_.jpg"
    },
    {
        "id": "ref_81",
        "name": "Interruptor de encendido (Switch)",
        "category": "Sistema Eléctrico",
        "cost": 180,
        "price": 290,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/81_interruptor_de_encendido__switch_.jpg"
    },
    {
        "id": "ref_82",
        "name": "Faro delantero",
        "category": "Sistema Eléctrico",
        "cost": 850,
        "price": 1300,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/82_faro_delantero.jpg"
    },
    {
        "id": "ref_83",
        "name": "Calavera (Faro trasero)",
        "category": "Sistema Eléctrico",
        "cost": 450,
        "price": 700,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/83_calavera__faro_trasero_.jpg"
    },
    {
        "id": "ref_84",
        "name": "Foco direccional",
        "category": "Sistema Eléctrico",
        "cost": 15,
        "price": 35,
        "stock": 35,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/84_foco_direccional.jpg"
    },
    {
        "id": "ref_85",
        "name": "Sensor de oxígeno (Sonda Lambda)",
        "category": "Sistema Eléctrico",
        "cost": 550,
        "price": 850,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/85_sensor_de_ox_geno__sonda_lambda_.gif"
    },
    {
        "id": "ref_86",
        "name": "Sensor MAF",
        "category": "Sistema Eléctrico",
        "cost": 650,
        "price": 1000,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/86_sensor_maf.jpg"
    },
    {
        "id": "ref_87",
        "name": "Claxon (Bocina)",
        "category": "Sistema Eléctrico",
        "cost": 150,
        "price": 250,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/87_claxon__bocina_.webp"
    },
    {
        "id": "ref_88",
        "name": "Fascia delantera (Defensa)",
        "category": "Carrocería y Otros",
        "cost": 1200,
        "price": 1850,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/88_fascia_delantera__defensa_.jpg"
    },
    {
        "id": "ref_89",
        "name": "Fascia trasera",
        "category": "Carrocería y Otros",
        "cost": 1100,
        "price": 1700,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/89_fascia_trasera.jpg"
    },
    {
        "id": "ref_90",
        "name": "Cofre (Capó)",
        "category": "Carrocería y Otros",
        "cost": 1800,
        "price": 2800,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/90_cofre__cap__.webp"
    },
    {
        "id": "ref_91",
        "name": "Puerta",
        "category": "Carrocería y Otros",
        "cost": 2500,
        "price": 3800,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/91_puerta.jpg"
    },
    {
        "id": "ref_92",
        "name": "Espejo retrovisor interior",
        "category": "Carrocería y Otros",
        "cost": 150,
        "price": 280,
        "stock": 20,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/92_espejo_retrovisor_interior.png"
    },
    {
        "id": "ref_93",
        "name": "Espejo lateral",
        "category": "Carrocería y Otros",
        "cost": 450,
        "price": 750,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/93_espejo_lateral.jpg"
    },
    {
        "id": "ref_94",
        "name": "Parabrisas",
        "category": "Carrocería y Otros",
        "cost": 1500,
        "price": 2400,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/94_parabrisas.png"
    },
    {
        "id": "ref_95",
        "name": "Ventanilla lateral",
        "category": "Carrocería y Otros",
        "cost": 600,
        "price": 950,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/95_ventanilla_lateral.jpeg"
    },
    {
        "id": "ref_96",
        "name": "Asiento",
        "category": "Carrocería y Otros",
        "cost": 1800,
        "price": 2800,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/96_asiento.jpg"
    },
    {
        "id": "ref_97",
        "name": "Cinturón de seguridad",
        "category": "Carrocería y Otros",
        "cost": 350,
        "price": 550,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/97_cintur_n_de_seguridad.webp"
    },
    {
        "id": "ref_98",
        "name": "Tanque de combustible",
        "category": "Carrocería y Otros",
        "cost": 1600,
        "price": 2500,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/98_tanque_de_combustible.jpg"
    },
    {
        "id": "ref_99",
        "name": "Rin (Aro de rueda)",
        "category": "Carrocería y Otros",
        "cost": 800,
        "price": 1250,
        "stock": 15,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/99_rin__aro_de_rueda_.jpeg"
    },
    {
        "id": "ref_100",
        "name": "Neumático (Llanta)",
        "category": "Carrocería y Otros",
        "cost": 1100,
        "price": 1650,
        "stock": 8,
        "created": "2026-10-14T09:40:00.000Z",
        "image": "fotos_recolectadas/100_neum_tico__llanta_.jpg"
    }
];
let catalog = JSON.parse(JSON.stringify(REFACCIONES_CATALOG));
catalog.forEach(p => { if(p.stock === undefined || p.stock === null) p.stock = 20; });
let salesLog = [];
let expenses = [];
let ticket = [];
let posChart;

async function initPosData(){
    if (!window.FirebaseService) {
        await new Promise(r => {
            window.addEventListener('firebase-initialized', r, { once: true });
            setTimeout(r, 1500);
        });
    }

    try {
        if (window.FirebaseService && window.FirebaseService.products) {
            await window.FirebaseService.products.seedIfEmpty(REFACCIONES_CATALOG);
            const cloudCatalog = await window.FirebaseService.products.getAll();
            if (cloudCatalog && cloudCatalog.length > 0) {
                let missingImagesCount = 0;
                catalog = cloudCatalog.map(p => {
                    const localRef = REFACCIONES_CATALOG.find(r => r.id === p.id);
                    if (!p.image && localRef && localRef.image) {
                        p.image = localRef.image;
                        missingImagesCount++;
                    }
                    return p;
                });
                if (missingImagesCount > 0 && window.FirebaseService.products.syncImages) {
                    window.FirebaseService.products.syncImages(REFACCIONES_CATALOG).catch(console.error);
                }
            }
            // Suscripción reactiva a cambios en catálogo
            window.FirebaseService.products.subscribe((updated) => {
                if (updated && updated.length > 0) {
                    catalog = updated;
                    renderCatalog();
                    updateProductSelect();
                    if (typeof renderAlmacenDashboard === 'function') renderAlmacenDashboard();
                }
            });
        }

        if (window.FirebaseService && window.FirebaseService.sales) {
            const cloudSales = await window.FirebaseService.sales.getAll(300);
            if (cloudSales) {
                salesLog = cloudSales;
            }
            // Suscripción reactiva a ventas
            window.FirebaseService.sales.subscribe((updated) => {
                if (updated) {
                    salesLog = updated;
                    upPosSummary();
                    upPosStats();
                }
            });
        }

        if (window.FirebaseService && window.FirebaseService.stats) {
            const cloudExpenses = await window.FirebaseService.stats.getExpenses();
            if (cloudExpenses) {
                expenses = cloudExpenses;
            }
        }
    } catch(e) {
        console.error('[Error al sincronizar POS con Firestore]', e);
    }

    renderCatalog();
    updateProductSelect();
    upPosSummary();
    upPosStats();
}

async function reloadRefaccionesCatalog(){
    if(confirm('¿Recargar el catálogo con las 100 refacciones completas en Cloud Firestore?')){
        catalog = JSON.parse(JSON.stringify(REFACCIONES_CATALOG));
        if (window.FirebaseService && window.FirebaseService.products) {
            await window.FirebaseService.products.seedIfEmpty(REFACCIONES_CATALOG);
        }
        renderCatalog();
        updateProductSelect();
        onSellProductChange();
        showGlobalToast('✓ Catálogo de 100 refacciones sincronizado con Firestore.', 'success');
    }
}

function initPosChart(){if(posChart)posChart.destroy();posChart=new Chart(document.getElementById('cPosBars'),{type:'bar',data:{labels:[],datasets:[{label:'Ventas ($)',data:[],backgroundColor:'rgba(16,185,129,.55)',borderRadius:8,borderSkipped:false},{label:'Costo ($)',data:[],backgroundColor:'rgba(244,63,94,.35)',borderRadius:8,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{position:'bottom',labels:{font:{size:9},boxWidth:10}}},scales:{x:{ticks:{callback:v=>'$'+v},grid:{color:'rgba(51,65,85,.3)'},border:{display:false}},y:{ticks:{font:{size:10}},grid:{display:false},border:{display:false}}}}});}
initPosChart();

async function addProduct(){
    if(!hasPermission('catalog.edit')){
        showAccessDeniedModal('Solo el Administrador tiene autorización para dar de alta nuevos productos en el catálogo.');
        return;
    }
    const name=document.getElementById('cat-name').value.trim();
    const price=parseFloat(document.getElementById('cat-price').value);
    const cost=parseFloat(document.getElementById('cat-cost').value);
    const stockInput=parseInt(document.getElementById('cat-stock').value);
    if(!name||isNaN(price)||isNaN(cost)){alert('Completa los campos de nombre, precio y costo.');return;}
    const stock = isNaN(stockInput) || stockInput < 0 ? 0 : stockInput;
    const newProd = {id:'p_'+Date.now(),name,price,cost,stock,category:'General',created:new Date().toISOString()};
    catalog.push(newProd);
    if (window.FirebaseService && window.FirebaseService.products) {
        await window.FirebaseService.products.save(newProd);
    }
    logActivity('Producto Creado', `Producto "${name}" agregado al catálogo en Firestore ($${price})`, 'success');
    document.getElementById('cat-name').value='';document.getElementById('cat-price').value='';document.getElementById('cat-cost').value='';
    document.getElementById('cat-stock').value='20';
    renderCatalog();
    updateProductSelect();
    showGlobalToast(`✓ Producto "${name}" guardado en Cloud Firestore`, 'success');
}

async function removeProduct(id){
    if(!hasPermission('catalog.delete') && (!currentUser || currentUser.role !== 'admin')){
        showAccessDeniedModal('Acceso Restringido: Los usuarios de tipo Almacén no tienen permitido eliminar productos. Solo los Administradores cuentan con autorización para realizar eliminaciones en el catálogo.');
        return;
    }
    if(confirm('¿Eliminar este producto del catálogo en Firestore?')){
        const prod = catalog.find(p => p.id === id);
        catalog=catalog.filter(p=>p.id!==id);
        if (window.FirebaseService && window.FirebaseService.products) {
            await window.FirebaseService.products.delete(id);
        }
        logActivity('Producto Eliminado', `Producto "${prod ? prod.name : id}" eliminado del catálogo en Firestore.`, 'danger');
        renderCatalog();
        updateProductSelect();
        showGlobalToast(`✓ Producto eliminado de Cloud Firestore.`, 'info');
    }
}

async function addStockToProduct(){
    if(!hasPermission('inventory.adjust')){
        showAccessDeniedModal('Solo un Supervisor o Administrador puede reabastecer inventario.');
        return;
    }
    const pid = document.getElementById('restock-product').value;
    const qty = parseInt(document.getElementById('restock-qty').value);
    if(!pid){ alert('Selecciona un producto para reabastecer.'); return; }
    if(isNaN(qty) || qty <= 0){ alert('Ingresa una cantidad válida mayor a 0.'); return; }
    const prod = catalog.find(p => p.id === pid);
    if(!prod) return;
    prod.stock = (prod.stock || 0) + qty;
    if (window.FirebaseService && window.FirebaseService.products) {
        await window.FirebaseService.products.updateStock(pid, prod.stock);
    }
    logActivity('Stock Reabastecido', `Se sumaron ${qty} u. al producto "${prod.name}" en Firestore.`, 'info');
    document.getElementById('restock-qty').value = '10';
    clearProductSelection('restock');
    renderCatalog();
    updateProductSelect();
    onSellProductChange();
    showGlobalToast(`✓ Se agregaron ${qty} unidades a "${prod.name}" (Firestore).`, 'success');
}

async function quickAddStock(id, amount){
    if(!hasPermission('inventory.adjust')){
        showAccessDeniedModal('Solo un Supervisor o Administrador puede modificar existencias de inventario.');
        return;
    }
    const prod = catalog.find(p => p.id === id);
    if(!prod) return;
    let addQty = amount;
    if(addQty === undefined){
        const val = prompt(`Reabastecer inventario de "${prod.name}"\nStock actual: ${prod.stock || 0} unidades.\n\n¿Cuántas unidades deseas sumar?`, "10");
        if(val === null) return;
        addQty = parseInt(val);
    }
    if(isNaN(addQty) || addQty <= 0){ alert('Cantidad inválida.'); return; }
    prod.stock = (prod.stock || 0) + addQty;
    if (window.FirebaseService && window.FirebaseService.products) {
        await window.FirebaseService.products.updateStock(id, prod.stock);
    }
    logActivity('Stock Reabastecido', `Reabastecimiento rápido de ${addQty} u. en "${prod.name}" en Firestore.`, 'info');
    renderCatalog();
    updateProductSelect();
    onSellProductChange();
}

function renderCatalog(){
    document.getElementById('cat-count').textContent=catalog.length;
    if(catalog.length===0){
        document.getElementById('cat-list').innerHTML='<div class="text-slate-600 text-sm text-center py-8">Aún no hay productos registrados.</div>';
        updateProductSelect();
        return;
    }
    const canViewFinance = hasPermission('finance.view_analysis');
    const canAdjustStock = hasPermission('inventory.adjust');
    const canEditCatalog = hasPermission('catalog.edit');
    const canDeleteCatalog = hasPermission('catalog.delete') || (currentUser && currentUser.role === 'admin');

    document.getElementById('cat-list').innerHTML=catalog.map(p=>{
        const isOutOfStock = (p.stock || 0) <= 0;
        const isLowStock = !isOutOfStock && p.stock <= 5;
        const categoryBadge = p.category ? `<span class="pill bg-slate-800 text-slate-300 border border-slate-700/60 font-medium text-[9px] shrink-0">${p.category}</span>` : '';
        const stockBadge = isOutOfStock
            ? `<span class="pill bg-rose-500/20 text-rose-300 border border-rose-500/35 font-bold text-[9px] flex items-center gap-1 shrink-0"><i data-lucide="alert-octagon" class="w-2.5 h-2.5 text-rose-400"></i>AGOTADO (0 u.)</span>`
            : isLowStock
            ? `<span class="pill bg-amber-500/20 text-amber-300 border border-amber-500/35 font-bold text-[9px] flex items-center gap-1 shrink-0"><i data-lucide="alert-triangle" class="w-2.5 h-2.5 text-amber-400"></i>Stock Bajo (${p.stock} u.)</span>`
            : `<span class="pill bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[9px] flex items-center gap-1 shrink-0"><i data-lucide="boxes" class="w-2.5 h-2.5 text-emerald-400"></i>Stock: ${p.stock} u.</span>`;

        const financeInfo = canViewFinance
            ? `Venta: ${fmt(p.price)} · Costo: ${fmt(p.cost)} · Margen: <span class="${((p.price-p.cost)/p.price*100)>30?'text-emerald-400':'text-amber-400'}">${((p.price-p.cost)/p.price*100).toFixed(0)}%</span>`
            : `Precio de Venta: <span class="text-emerald-400 font-bold">${fmt(p.price)}</span>`;

        const btnStock = canAdjustStock
            ? `<button onclick="quickAddStock('${p.id}')" title="Reabastecer inventario" class="p-1 px-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10.5px] border border-indigo-500/30 flex items-center gap-1 transition shrink-0"><i data-lucide="plus" class="w-3 h-3"></i>Stock</button>`
            : '';

        const canSell = hasPermission('pos.sell');
        const btnSell = (canSell && !isOutOfStock)
            ? `<button onclick="quickSellProduct('${p.id}')" title="Vender este producto" class="p-1 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10.5px] border border-emerald-500/30 flex items-center gap-1 transition shrink-0"><i data-lucide="shopping-cart" class="w-3 h-3"></i>Vender</button>`
            : '';

        const btnDelete = canDeleteCatalog
            ? `<button onclick="removeProduct('${p.id}')" class="text-slate-600 hover:text-rose-400 transition p-1 shrink-0" title="Eliminar producto (Solo Administrador)"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`
            : '';

        const imgTag = p.image 
            ? `<div class="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm">
                   <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<i data-lucide=&quot;package&quot; class=&quot;w-5 h-5 text-slate-500&quot;></i>';">
               </div>`
            : `<div class="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center text-slate-500"><i data-lucide="package" class="w-5 h-5"></i></div>`;

        return `
        <div class="pos-row flex items-center gap-3">
            ${imgTag}
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span class="text-sm font-semibold text-white truncate">${p.name}</span>
                    ${categoryBadge}
                    ${stockBadge}
                </div>
                <div class="text-[11px] text-slate-400 mono">
                    ${financeInfo}
                </div>
            </div>
            ${btnSell}
            ${btnStock}
            ${btnDelete}
        </div>`;
    }).join('');
    lucide.createIcons();
    updateProductSelect();
}

// ===== BUSCADOR INTELIGENTE DE PRODUCTOS (INSENSIBLE A MAYÚSCULAS Y ACENTOS) =====

function normalizeSearchText(str) {
    if (!str) return '';
    return str
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function highlightSearchMatch(text, query) {
    if (!text) return '';
    if (!query) return escapeHtml(text);
    const normText = normalizeSearchText(text);
    const normQuery = normalizeSearchText(query);
    const idx = normText.indexOf(normQuery);
    if (idx === -1) return escapeHtml(text);
    const matchLen = normQuery.length;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + matchLen);
    const after = text.slice(idx + matchLen);
    return `${escapeHtml(before)}<span class="bg-amber-400/30 text-amber-200 font-bold px-0.5 rounded">${escapeHtml(match)}</span>${escapeHtml(after)}`;
}

function toggleProductDropdown(type, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const list = document.getElementById(`${type}-dropdown-list`);
    if (!list) return;
    const isHidden = list.classList.contains('hidden');
    if (isHidden) {
        openProductDropdown(type);
        const searchInput = document.getElementById(`${type}-product-search`);
        if (searchInput) searchInput.focus();
    } else {
        closeProductDropdown(type);
    }
}

function handleProductInputClick(type, event) {
    if (event) {
        event.stopPropagation();
    }
    const searchInput = document.getElementById(`${type}-product-search`);
    if (searchInput) searchInput.select();
    openProductDropdown(type);
}

function handleProductInputFocus(type) {
    openProductDropdown(type);
}

function handleProductInputKeydown(type, e) {
    if (e.key === 'Escape') {
        closeProductDropdown(type);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const list = document.getElementById(`${type}-dropdown-list`);
        if (list && !list.classList.contains('hidden')) {
            const firstOption = list.querySelector('[data-product-id]');
            if (firstOption) {
                const pid = firstOption.getAttribute('data-product-id');
                selectDropdownProduct(type, pid);
            }
        }
    }
}

function openProductDropdown(type) {
    const list = document.getElementById(`${type}-dropdown-list`);
    const chevron = document.getElementById(`${type}-chevron-icon`);
    if (!list) return;

    filterProductDropdown(type);
    list.classList.remove('hidden');
    if (chevron) chevron.style.transform = 'rotate(180deg)';
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons({ root: list });
    }
}

function closeProductDropdown(type) {
    const list = document.getElementById(`${type}-dropdown-list`);
    const chevron = document.getElementById(`${type}-chevron-icon`);
    if (list) list.classList.add('hidden');
    if (chevron) chevron.style.transform = 'rotate(0deg)';
}

function clearProductSelection(type, event) {
    if (event) {
        event.stopPropagation();
    }
    const searchInput = document.getElementById(`${type}-product-search`);
    const selectEl = document.getElementById(`${type}-product`);
    const clearBtn = document.getElementById(`${type}-clear-btn`);

    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    if (selectEl) selectEl.value = '';
    if (clearBtn) clearBtn.classList.add('hidden');

    if (type === 'sell') {
        onSellProductChange(true);
    } else if (type === 'restock') {
        const rPrev = document.getElementById('restock-product-preview');
        if (rPrev) rPrev.classList.add('hidden');
    }
    filterProductDropdown(type);
    const list = document.getElementById(`${type}-dropdown-list`);
    if (list) list.classList.remove('hidden');
}

function selectDropdownProduct(type, pid) {
    const prod = (catalog || []).find(p => p.id === pid);
    if (!prod) return;

    const selectEl = document.getElementById(`${type}-product`);
    const searchInput = document.getElementById(`${type}-product-search`);
    const clearBtn = document.getElementById(`${type}-clear-btn`);

    if (selectEl) {
        if (!selectEl.querySelector(`option[value="${prod.id}"]`)) {
            const opt = document.createElement('option');
            opt.value = prod.id;
            opt.textContent = prod.name;
            selectEl.appendChild(opt);
        }
        selectEl.value = prod.id;
    }
    if (clearBtn) clearBtn.classList.remove('hidden');

    if (type === 'sell') {
        if (searchInput) {
            searchInput.value = `${prod.name} (${fmt(prod.price)}) · Stock: ${prod.stock} u.`;
        }
        onSellProductChange(false);
    } else if (type === 'restock') {
        if (searchInput) {
            searchInput.value = `${prod.name} (Stock: ${prod.stock || 0} u.)`;
        }
        const rPrev = document.getElementById('restock-product-preview');
        const rImg = document.getElementById('restock-preview-img');
        const rName = document.getElementById('restock-preview-name');
        const rCat = document.getElementById('restock-preview-cat');
        const rInfo = document.getElementById('restock-preview-info');
        if (rPrev && rImg && rName) {
            rImg.src = prod.image || '';
            rName.textContent = prod.name;
            if (rCat) rCat.textContent = prod.category || 'Refacción';
            if (rInfo) rInfo.textContent = `Costo: ${fmt(prod.cost || 0)} · Precio: ${fmt(prod.price || 0)} · Stock actual: ${prod.stock || 0} u.`;
            rPrev.classList.remove('hidden');
        }
    }

    closeProductDropdown(type);
}

function filterProductDropdown(type) {
    const searchInput = document.getElementById(`${type}-product-search`);
    const listContainer = document.getElementById(`${type}-dropdown-list`);
    const clearBtn = document.getElementById(`${type}-clear-btn`);
    if (!listContainer) return;

    const rawVal = searchInput ? searchInput.value.trim() : '';
    const query = normalizeSearchText(rawVal);

    if (clearBtn) {
        clearBtn.classList.toggle('hidden', !rawVal);
    }

    const selectEl = document.getElementById(`${type}-product`);
    const selectedProd = (catalog || []).find(p => p.id === (selectEl ? selectEl.value : ''));
    let effectiveQuery = query;
    if (selectedProd && rawVal.includes(selectedProd.name)) {
        effectiveQuery = '';
    }

    // Filtrar catálogo ignorando mayúsculas, minúsculas y acentos
    const matches = (catalog || []).filter(p => {
        if (!effectiveQuery) return true;
        const normName = normalizeSearchText(p.name);
        const normCat = normalizeSearchText(p.category);
        return normName.includes(effectiveQuery) || normCat.includes(effectiveQuery);
    });

    // Encabezado de estado dentro del menú desplegable
    let headerHtml = '';
    if (effectiveQuery) {
        headerHtml = `
            <div class="px-3 py-1.5 text-[10px] font-semibold text-sky-300 bg-slate-900 border-b border-slate-800 flex justify-between items-center sticky top-0 z-20">
                <span><i data-lucide="filter" class="w-3 h-3 inline mr-1 text-sky-400"></i>${matches.length} ${matches.length === 1 ? 'coincidencia' : 'coincidencias'}</span>
                <span class="text-[9px] text-slate-400 truncate max-w-[130px]">Filtro: "${escapeHtml(rawVal)}"</span>
            </div>
        `;
    } else {
        headerHtml = `
            <div class="px-3 py-1.5 text-[10px] font-semibold text-slate-300 bg-slate-900 border-b border-slate-800 flex justify-between items-center sticky top-0 z-20">
                <span><i data-lucide="list" class="w-3 h-3 inline mr-1 text-slate-400"></i>Catálogo completo (${catalog.length} refacciones)</span>
                <span class="text-[9px] text-slate-500">Haz clic para elegir</span>
            </div>
        `;
    }

    if (matches.length === 0) {
        listContainer.innerHTML = headerHtml + `
            <div class="p-4 text-center text-xs text-slate-400">
                <i data-lucide="search-x" class="w-5 h-5 mx-auto mb-1.5 text-rose-400/80"></i>
                <div class="font-medium text-slate-200 mb-0.5">Sin coincidencias</div>
                <div class="text-[10px] text-slate-500">No encontramos productos con "<b>${escapeHtml(rawVal)}</b>".</div>
                <button type="button" onclick="clearProductSelection('${type}', event)" class="mt-2.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10.5px] text-sky-300 border border-slate-700 transition">Ver todo el catálogo</button>
            </div>
        `;
    } else {
        const itemsHtml = matches.map(p => {
            const isOut = (p.stock || 0) <= 0;
            const catBadge = p.category ? `<span class="pill bg-slate-800 text-slate-300 border border-slate-700 text-[8.5px] uppercase font-mono">${escapeHtml(p.category)}</span>` : '';
            const displayName = highlightSearchMatch(p.name, effectiveQuery);

            if (type === 'sell') {
                const stockBadge = isOut 
                    ? `<span class="pill bg-rose-500/20 text-rose-300 border border-rose-500/35 text-[9px] font-bold">⛔ AGOTADO</span>`
                    : `<span class="text-xs font-semibold text-emerald-400 font-mono">Stock: ${p.stock} u.</span>`;

                const thumb = p.image 
                    ? `<div class="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                           <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" class="w-full h-full object-cover" onerror="this.parentElement.style.display='none';">
                       </div>`
                    : '';

                return `
                    <div data-product-id="${p.id}"
                         onclick="selectDropdownProduct('sell', '${p.id}')" 
                         class="p-2.5 hover:bg-sky-600/25 cursor-pointer transition flex items-center justify-between gap-3 text-left group border-b border-slate-800/60 last:border-b-0">
                        <div class="flex items-center gap-3 min-w-0 flex-1">
                            ${thumb}
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-1.5 mb-0.5">
                                    ${catBadge}
                                    <span class="text-xs font-semibold text-slate-200 group-hover:text-white truncate">${displayName}</span>
                                </div>
                                <div class="text-[11px] text-sky-400 font-bold font-mono">
                                    ${fmt(p.price)}
                                </div>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            ${stockBadge}
                        </div>
                    </div>
                `;
            } else {
                const thumb = p.image 
                    ? `<div class="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                           <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" class="w-full h-full object-cover" onerror="this.parentElement.style.display='none';">
                       </div>`
                    : '';

                return `
                    <div data-product-id="${p.id}"
                         onclick="selectDropdownProduct('restock', '${p.id}')" 
                         class="p-2.5 hover:bg-indigo-600/25 cursor-pointer transition flex items-center justify-between gap-3 text-left group border-b border-slate-800/60 last:border-b-0">
                        <div class="flex items-center gap-3 min-w-0 flex-1">
                            ${thumb}
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-1.5 mb-0.5">
                                    ${catBadge}
                                    <span class="text-xs font-semibold text-slate-200 group-hover:text-white truncate">${displayName}</span>
                                </div>
                                <div class="text-[11px] text-slate-400 font-mono">
                                    Costo: ${fmt(p.cost || 0)} · Precio: ${fmt(p.price || 0)}
                                </div>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            <span class="text-xs font-semibold text-indigo-300 font-mono">Stock: ${p.stock || 0} u.</span>
                        </div>
                    </div>
                `;
            }
        }).join('');

        listContainer.innerHTML = headerHtml + itemsHtml;
    }

    listContainer.classList.remove('hidden');
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons({ root: listContainer });
    }
}

// Cierre automático seguro al hacer clic fuera del componente (Light Dismiss)
document.addEventListener('click', (e) => {
    const sellWrap = document.getElementById('sell-combobox-wrap');
    if (sellWrap && !sellWrap.contains(e.target) && !e.target.closest('#sell-combobox-wrap')) {
        closeProductDropdown('sell');
    }
    const restockWrap = document.getElementById('restock-combobox-wrap');
    if (restockWrap && !restockWrap.contains(e.target) && !e.target.closest('#restock-combobox-wrap')) {
        closeProductDropdown('restock');
    }
});

function updateProductSelect(){
    const sel=document.getElementById('sell-product');
    const restockSel=document.getElementById('restock-product');
    
    // Sell select
    let sellOpts = '<option value="">— Seleccionar producto —</option>';
    catalog.forEach(p => {
        const catPrefix = p.category ? `[${p.category}] ` : '';
        const isOut = (p.stock || 0) <= 0;
        if(isOut){
            sellOpts += `<option value="${p.id}" class="text-rose-400 font-semibold bg-slate-900">⛔ ${catPrefix}${p.name} — (AGOTADO - 0 en stock)</option>`;
        } else {
            sellOpts += `<option value="${p.id}">${catPrefix}${p.name} (${fmt(p.price)}) · Stock: ${p.stock} u.</option>`;
        }
    });
    sel.innerHTML = sellOpts;

    // Restock select
    if(restockSel){
        restockSel.innerHTML = '<option value="">— Seleccionar producto para reabastecer —</option>' + 
            catalog.map(p => {
                const catPrefix = p.category ? `[${p.category}] ` : '';
                return `<option value="${p.id}">${catPrefix}${p.name} (Stock actual: ${p.stock || 0} u.)</option>`;
            }).join('');
    }
}

function onSellProductChange(fromProgrammatic = false){
    const sel = document.getElementById('sell-product');
    const pid = sel ? sel.value : '';
    const searchInput = document.getElementById('sell-product-search');
    const clearBtn = document.getElementById('sell-clear-btn');
    const alertEl = document.getElementById('sell-stock-alert');
    const badgeEl = document.getElementById('sell-stock-badge');
    const badgeNum = document.getElementById('sell-stock-num');
    const btnAdd = document.getElementById('btn-add-ticket');
    const qtyInput = document.getElementById('sell-qty');
    const qtyLabel = document.getElementById('sell-qty-label');

    const sPrev = document.getElementById('sell-product-preview');
    if(!pid){
        if(sPrev) sPrev.classList.add('hidden');
        if(searchInput && fromProgrammatic) searchInput.value = '';
        if(clearBtn && fromProgrammatic) clearBtn.classList.add('hidden');
        if(alertEl){ alertEl.classList.add('hidden'); alertEl.innerHTML = ''; }
        if(badgeEl) badgeEl.classList.add('hidden');
        if(btnAdd){
            btnAdd.disabled = false;
            btnAdd.classList.remove('opacity-40', 'cursor-not-allowed');
        }
        if(qtyInput) qtyInput.disabled = false;
        if(qtyLabel) qtyLabel.textContent = '¿Cuántas piezas requieren de este producto?';
        return;
    }

    const prod = catalog.find(p => p.id === pid);
    if(!prod) return;

    if(searchInput && (!searchInput.value || fromProgrammatic === false)){
        searchInput.value = `${prod.name} (${fmt(prod.price)}) · Stock: ${prod.stock} u.`;
        if(clearBtn) clearBtn.classList.remove('hidden');
    }
    const sImg = document.getElementById('sell-preview-img');
    const sName = document.getElementById('sell-preview-name');
    const sCat = document.getElementById('sell-preview-cat');
    const sPrice = document.getElementById('sell-preview-price');
    if(sPrev && sImg && sName){
        sImg.src = prod.image || '';
        sName.textContent = prod.name;
        if(sCat) sCat.textContent = prod.category || 'Refacción';
        if(sPrice) sPrice.textContent = fmt(prod.price);
        sPrev.classList.remove('hidden');
    }

    const stock = prod.stock || 0;
    const inTicket = (ticket.find(t => t.id === pid)?.qty) || 0;
    const remaining = stock - inTicket;

    if(badgeEl) badgeEl.classList.remove('hidden');
    if(badgeNum){
        badgeNum.textContent = remaining > 0 ? remaining : 0;
        badgeNum.className = remaining <= 0 ? 'text-rose-400 font-bold' : remaining <= 5 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold';
    }

    if(qtyLabel){
        qtyLabel.textContent = `¿Cuántas piezas requieren de ${prod.name}?`;
    }

    if(stock <= 0){
        // Completely out of stock
        if(alertEl){
            alertEl.classList.remove('hidden');
            alertEl.innerHTML = `
            <div class="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-200 text-xs flex items-center gap-2.5 font-medium fin">
                <div class="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                    <i data-lucide="alert-octagon" class="w-4 h-4"></i>
                </div>
                <div class="flex-1">
                    <b class="text-rose-300 uppercase tracking-wide text-[10px] block">Producto Agotado</b>
                    <span>No hay existencias de <b>"${prod.name}"</b>. Opción de venta bloqueada hasta reabastecer en Catálogo.</span>
                </div>
            </div>`;
        }
        if(btnAdd){
            btnAdd.disabled = true;
            btnAdd.classList.add('opacity-40', 'cursor-not-allowed');
        }
        if(qtyInput) qtyInput.disabled = true;
    } else if(remaining <= 0){
        // Stock exhausted by current ticket
        if(alertEl){
            alertEl.classList.remove('hidden');
            alertEl.innerHTML = `
            <div class="p-3 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs flex items-center gap-2.5 font-medium fin">
                <div class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                </div>
                <div class="flex-1">
                    <b class="text-amber-300 uppercase tracking-wide text-[10px] block">Stock Máximo Alcanzado en Ticket</b>
                    <span>Ya tienes agregadas las <b>${stock} unidades</b> disponibles de "${prod.name}".</span>
                </div>
            </div>`;
        }
        if(btnAdd){
            btnAdd.disabled = true;
            btnAdd.classList.add('opacity-40', 'cursor-not-allowed');
        }
        if(qtyInput) qtyInput.disabled = true;
    } else {
        // Normal in-stock state
        if(alertEl){ alertEl.classList.add('hidden'); alertEl.innerHTML = ''; }
        if(btnAdd){
            btnAdd.disabled = false;
            btnAdd.classList.remove('opacity-40', 'cursor-not-allowed');
        }
        if(qtyInput){
            qtyInput.disabled = false;
            qtyInput.max = remaining;
            if(parseInt(qtyInput.value) > remaining) qtyInput.value = remaining;
            if(parseInt(qtyInput.value) < 1) qtyInput.value = 1;
        }

        // Directamente abre el modal preguntando cuántas piezas requieren
        if(!fromProgrammatic){
            openSellQtyModal(pid);
        }
    }
    lucide.createIcons();
}

function openSellQtyModal(pid){
    const prod = catalog.find(p => p.id === pid);
    if(!prod) return;
    const inTicket = (ticket.find(t => t.id === pid)?.qty) || 0;
    const remaining = (prod.stock || 0) - inTicket;
    if(remaining <= 0) return;

    document.getElementById('sqm-product-id').value = pid;
    document.getElementById('sqm-product-name').textContent = prod.name;
    document.getElementById('sqm-product-price').textContent = fmt(prod.price);
    document.getElementById('sqm-product-stock').textContent = `${remaining} u. disponibles`;
    
    const input = document.getElementById('sqm-qty-input');
    input.value = 1;
    input.max = remaining;
    input.min = 1;

    updateSellQtyModalSubtotal();

    const modal = document.getElementById('sell-qty-modal');
    if(modal) modal.classList.remove('hidden');
    setTimeout(() => {
        if(input){
            input.focus();
            input.select();
        }
    }, 50);
    lucide.createIcons();
}

function closeSellQtyModal(){
    const modal = document.getElementById('sell-qty-modal');
    if(modal) modal.classList.add('hidden');
    const qtyInput = document.getElementById('sell-qty');
    if(qtyInput){
        qtyInput.focus();
        qtyInput.select();
    }
}

function updateSellQtyModalSubtotal(){
    const pid = document.getElementById('sqm-product-id').value;
    const input = document.getElementById('sqm-qty-input');
    const subEl = document.getElementById('sqm-subtotal');
    const prod = catalog.find(p => p.id === pid);
    if(!prod || !input || !subEl) return;
    const qty = parseInt(input.value) || 0;
    subEl.textContent = fmt(prod.price * Math.max(0, qty));
}

function stepSellQtyModal(delta){
    const pid = document.getElementById('sqm-product-id').value;
    const input = document.getElementById('sqm-qty-input');
    const prod = catalog.find(p => p.id === pid);
    if(!prod || !input) return;
    const inTicket = (ticket.find(t => t.id === pid)?.qty) || 0;
    const max = (prod.stock || 0) - inTicket;
    let cur = parseInt(input.value) || 1;
    cur += delta;
    if(cur < 1) cur = 1;
    if(cur > max) cur = max;
    input.value = cur;
    updateSellQtyModalSubtotal();
}

function setSellQtyModalValue(val){
    const pid = document.getElementById('sqm-product-id').value;
    const input = document.getElementById('sqm-qty-input');
    const prod = catalog.find(p => p.id === pid);
    if(!prod || !input) return;
    const inTicket = (ticket.find(t => t.id === pid)?.qty) || 0;
    const max = (prod.stock || 0) - inTicket;
    input.value = Math.min(Math.max(1, val), max);
    updateSellQtyModalSubtotal();
}

function setSellQtyModalMax(){
    const pid = document.getElementById('sqm-product-id').value;
    const input = document.getElementById('sqm-qty-input');
    const prod = catalog.find(p => p.id === pid);
    if(!prod || !input) return;
    const inTicket = (ticket.find(t => t.id === pid)?.qty) || 0;
    const max = (prod.stock || 0) - inTicket;
    input.value = Math.max(1, max);
    updateSellQtyModalSubtotal();
}

function confirmSellQtyModal(event){
    if(event) event.preventDefault();
    const pid = document.getElementById('sqm-product-id').value;
    const input = document.getElementById('sqm-qty-input');
    const qty = parseInt(input.value) || 1;
    addSaleItemWithQty(pid, qty);
    closeSellQtyModal();
}

function adjustSellQty(delta){
    const input = document.getElementById('sell-qty');
    const pid = document.getElementById('sell-product').value;
    if(!input) return;
    let cur = parseInt(input.value) || 1;
    cur += delta;
    if(cur < 1) cur = 1;
    if(pid){
        const prod = catalog.find(p => p.id === pid);
        if(prod){
            const inTicket = (ticket.find(t => t.id === pid)?.qty) || 0;
            const max = (prod.stock || 0) - inTicket;
            if(cur > max) cur = max;
        }
    }
    input.value = cur;
}

function addSaleItemWithQty(pid, qty){
    if(!hasPermission('pos.sell')){
        showAccessDeniedModal('Tu rol no tiene autorización para agregar productos al ticket de venta.');
        return;
    }
    if(!pid){alert('Selecciona un producto.');return;}
    const prod=catalog.find(p=>p.id===pid);if(!prod)return;

    const currentStock = prod.stock || 0;
    if(currentStock <= 0){
        alert(`⛔ Producto agotado: "${prod.name}" no tiene existencias en inventario. No se puede vender.`);
        onSellProductChange(true);
        return;
    }

    const existing=ticket.find(t=>t.id===pid);
    const alreadyInTicket = existing ? existing.qty : 0;
    if(alreadyInTicket + qty > currentStock){
        const maxCanAdd = currentStock - alreadyInTicket;
        alert(`⚠️ Inventario insuficiente para "${prod.name}".\nStock disponible: ${currentStock} u.\nYa en ticket: ${alreadyInTicket} u.\nSolo puedes agregar hasta ${maxCanAdd} u. más.`);
        onSellProductChange(true);
        return;
    }

    if(existing){
        existing.qty += qty;
    } else {
        ticket.push({id:pid, name:prod.name, price:prod.price, cost:prod.cost, qty, image: prod.image || ''});
    }

    const sel = document.getElementById('sell-product');
    if(sel) sel.value = '';
    const qtyInput = document.getElementById('sell-qty');
    if(qtyInput) qtyInput.value = '1';

    renderTicket();
    onSellProductChange(true);
    showGlobalToast(`✓ Se agregaron ${qty} pieza(s) de "${prod.name}" al ticket`, 'success');
}

function addSaleItem(){
    const pid=document.getElementById('sell-product').value;
    const qty=parseInt(document.getElementById('sell-qty').value)||1;
    addSaleItemWithQty(pid, qty);
}

function removeTicketItem(id){
    const item = ticket.find(t => t.id === id);
    ticket=ticket.filter(t=>t.id!==id);
    renderTicket();
    onSellProductChange(true);
    if(item){
        showGlobalToast(`"${item.name}" se quitó del ticket`, 'info');
    }
}

function quickSellProduct(pid){
    if(!hasPermission('pos.sell')){
        showAccessDeniedModal('Tu rol no tiene autorización para realizar ventas.');
        return;
    }
    showPosTab('sell');
    selectDropdownProduct('sell', pid);
}

function openModifyTicketQtyModal(id){
    const item = ticket.find(t => t.id === id);
    if(!item){
        alert('Producto no encontrado en el ticket.');
        return;
    }
    const prod = catalog.find(p => p.id === id);
    const maxStock = prod ? (prod.stock || 0) : item.qty;

    document.getElementById('tmq-item-id').value = id;
    document.getElementById('tmq-product-name').textContent = item.name;
    document.getElementById('tmq-product-price').textContent = fmt(item.price);
    document.getElementById('tmq-product-stock').textContent = `${maxStock} u. en almacén`;
    
    const input = document.getElementById('tmq-qty-input');
    input.value = item.qty;
    input.max = maxStock;
    input.min = 0;

    updateTicketModifyModalSubtotal();

    const modal = document.getElementById('ticket-modify-qty-modal');
    if(modal) modal.classList.remove('hidden');
    setTimeout(() => {
        if(input){
            input.focus();
            input.select();
        }
    }, 50);
    lucide.createIcons();
}

function closeTicketModifyModal(){
    const modal = document.getElementById('ticket-modify-qty-modal');
    if(modal) modal.classList.add('hidden');
}

function updateTicketModifyModalSubtotal(){
    const id = document.getElementById('tmq-item-id').value;
    const input = document.getElementById('tmq-qty-input');
    const subEl = document.getElementById('tmq-subtotal');
    const btnSubmit = document.getElementById('tmq-btn-submit');
    const item = ticket.find(t => t.id === id);
    if(!item || !input || !subEl) return;
    const qty = parseInt(input.value) || 0;
    subEl.textContent = fmt(item.price * Math.max(0, qty));

    if(btnSubmit){
        if(qty <= 0){
            btnSubmit.className = 'pos-btn bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 px-4 flex items-center gap-1.5 shadow-lg shadow-rose-600/20';
            btnSubmit.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>Quitar Producto (0 pzas)';
        } else {
            btnSubmit.className = 'pos-btn bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2 px-4 flex items-center gap-1.5 shadow-lg shadow-amber-600/20';
            btnSubmit.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i>Actualizar a ' + qty + ' pzas';
        }
        lucide.createIcons();
    }
}

function stepTicketModifyModal(delta){
    const id = document.getElementById('tmq-item-id').value;
    const input = document.getElementById('tmq-qty-input');
    const prod = catalog.find(p => p.id === id);
    const max = prod ? (prod.stock || 0) : 999;
    let cur = parseInt(input.value) || 0;
    cur += delta;
    if(cur < 0) cur = 0;
    if(cur > max) cur = max;
    input.value = cur;
    updateTicketModifyModalSubtotal();
}

function setTicketModifyModalValue(val){
    const id = document.getElementById('tmq-item-id').value;
    const input = document.getElementById('tmq-qty-input');
    const prod = catalog.find(p => p.id === id);
    const max = prod ? (prod.stock || 0) : 999;
    input.value = Math.min(Math.max(0, val), max);
    updateTicketModifyModalSubtotal();
}

function setTicketModifyModalMax(){
    const id = document.getElementById('tmq-item-id').value;
    const input = document.getElementById('tmq-qty-input');
    const prod = catalog.find(p => p.id === id);
    const max = prod ? (prod.stock || 0) : 1;
    input.value = max;
    updateTicketModifyModalSubtotal();
}

function confirmTicketModifyModal(event){
    if(event) event.preventDefault();
    const id = document.getElementById('tmq-item-id').value;
    const input = document.getElementById('tmq-qty-input');
    const newQty = parseInt(input.value) || 0;
    setTicketItemQty(id, newQty);
    closeTicketModifyModal();
}

function setTicketItemQty(id, newQty){
    const item = ticket.find(t => t.id === id);
    if(!item) return;

    if(newQty <= 0){
        // Si ese número se pone en 0, se quita dicho producto
        ticket = ticket.filter(t => t.id !== id);
        renderTicket();
        onSellProductChange(true);
        showGlobalToast(`"${item.name}" se quitó del ticket al quedar en 0 piezas`, 'info');
        return;
    }

    const prod = catalog.find(p => p.id === id);
    const currentStock = prod ? (prod.stock || 0) : 999;
    if(newQty > currentStock){
        alert(`⚠️ Inventario insuficiente para "${item.name}".\nExistencias disponibles en almacén: ${currentStock} piezas.\nNo se pueden llevar ${newQty} piezas.`);
        return;
    }

    item.qty = newQty;
    renderTicket();
    onSellProductChange(true);
    showGlobalToast(`✓ Se actualizaron las piezas de "${item.name}" a ${newQty} u.`, 'success');
}

function stepTicketItemDirect(id, delta){
    const item = ticket.find(t => t.id === id);
    if(!item) return;
    const newQty = item.qty + delta;
    setTicketItemQty(id, newQty);
}

let currentPaymentMethod = 'cash';

function setPaymentMethod(method){
    currentPaymentMethod = method;
    ['cash','card','transfer','split'].forEach(m => {
        const btn = document.getElementById('pay-btn-' + m);
        const panel = document.getElementById('pay-panel-' + m);
        if(btn){
            btn.className = `pay-method-btn p-2.5 rounded-lg border text-left transition flex items-center gap-2 ${m === method ? 'active-' + m : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'}`;
        }
        if(panel){
            panel.classList.toggle('hidden', m !== method);
        }
    });

    const badge = document.getElementById('payment-badge-status');
    if(badge){
        if(method === 'cash'){
            badge.className = 'pill bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-semibold';
            badge.textContent = 'Efectivo 100%';
        } else if(method === 'card'){
            badge.className = 'pill bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[9px] font-semibold';
            badge.textContent = 'Tarjeta 100%';
        } else if(method === 'transfer'){
            badge.className = 'pill bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[9px] font-semibold';
            badge.textContent = 'Transferencia 100%';
        } else if(method === 'split'){
            badge.className = 'pill bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-semibold';
            badge.textContent = 'Dividir Pago';
        }
    }

    updatePaymentTotals();
    lucide.createIcons();
}

function updatePaymentTotals(){
    const total = ticket.reduce((s,t) => s + t.price * t.qty, 0);
    const cashTotalEl = document.getElementById('cash-total-display');
    const cardTotalEl = document.getElementById('card-total-display');
    const transferTotalEl = document.getElementById('transfer-total-display');
    const splitTotalReqEl = document.getElementById('split-total-req');

    if(cashTotalEl) cashTotalEl.textContent = fmt(total);
    if(cardTotalEl) cardTotalEl.textContent = fmt(total);
    if(transferTotalEl) transferTotalEl.textContent = fmt(total);
    if(splitTotalReqEl) splitTotalReqEl.textContent = fmt(total);

    calculateCashChange();
    updateSplitCalculation();
}

function calculateCashChange(){
    const total = ticket.reduce((s,t) => s + t.price * t.qty, 0);
    const recInput = document.getElementById('cash-received');
    const changeBox = document.getElementById('cash-change-box');
    const shortBox = document.getElementById('cash-short-box');
    const changeAmount = document.getElementById('cash-change-amount');
    if(!recInput || !changeBox) return;

    const received = parseFloat(recInput.value);
    if(isNaN(received) || recInput.value.trim() === ''){
        changeBox.classList.add('hidden');
        if(shortBox) { shortBox.classList.add('hidden'); shortBox.innerHTML = ''; }
        return;
    }

    if(received >= total){
        const change = received - total;
        changeAmount.textContent = fmt(change);
        changeBox.classList.remove('hidden');
        if(shortBox) { shortBox.classList.add('hidden'); shortBox.innerHTML = ''; }
    } else {
        changeBox.classList.add('hidden');
        if(shortBox){
            const missing = total - received;
            shortBox.innerHTML = `<span class="flex items-center gap-1"><i data-lucide="alert-circle" class="w-3.5 h-3.5 shrink-0"></i>Monto recibido insuficiente. Faltan ${fmt(missing)} para cubrir el total.</span>`;
            shortBox.classList.remove('hidden');
            lucide.createIcons();
        }
    }
}

function updateSplitCalculation(){
    const total = ticket.reduce((s,t) => s + t.price * t.qty, 0);
    const amtCash = parseFloat(document.getElementById('split-amt-cash')?.value || 0) || 0;
    const amtCard = parseFloat(document.getElementById('split-amt-card')?.value || 0) || 0;
    const amtTransfer = parseFloat(document.getElementById('split-amt-transfer')?.value || 0) || 0;

    const sum = amtCash + amtCard + amtTransfer;
    const diff = total - sum;

    const sumEl = document.getElementById('split-sum-display');
    const diffLabelEl = document.getElementById('split-diff-label');
    const diffAmountEl = document.getElementById('split-diff-amount');
    const statusBox = document.getElementById('split-status-box');

    if(sumEl) sumEl.textContent = fmt(sum);

    if(diffAmountEl && diffLabelEl){
        if(total === 0){
            diffLabelEl.textContent = 'Restante:';
            diffAmountEl.textContent = '$0';
            diffAmountEl.className = 'font-bold mono text-slate-400';
            if(statusBox) statusBox.className = 'p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs';
        } else if(Math.abs(diff) < 0.01){
            diffLabelEl.textContent = 'Estado:';
            diffAmountEl.textContent = '✓ Total Cubierto Exacto';
            diffAmountEl.className = 'font-bold mono text-emerald-400';
            if(statusBox) statusBox.className = 'p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-between text-xs';
        } else if(diff > 0){
            diffLabelEl.textContent = 'Faltante:';
            diffAmountEl.textContent = fmt(diff);
            diffAmountEl.className = 'font-bold mono text-amber-400';
            if(statusBox) statusBox.className = 'p-2 rounded-lg bg-slate-900 border border-amber-500/30 flex items-center justify-between text-xs';
        } else {
            diffLabelEl.textContent = 'Excedente:';
            diffAmountEl.textContent = '+' + fmt(Math.abs(diff));
            diffAmountEl.className = 'font-bold mono text-rose-400';
            if(statusBox) statusBox.className = 'p-2 rounded-lg bg-slate-900 border border-rose-500/30 flex items-center justify-between text-xs';
        }
    }

    // Progress bar and percentages
    const pctCash = total > 0 ? Math.min(100, Math.max(0, (amtCash / total) * 100)) : 0;
    const pctCard = total > 0 ? Math.min(100, Math.max(0, (amtCard / total) * 100)) : 0;
    const pctTransfer = total > 0 ? Math.min(100, Math.max(0, (amtTransfer / total) * 100)) : 0;

    const barCash = document.getElementById('split-bar-cash');
    const barCard = document.getElementById('split-bar-card');
    const barTransfer = document.getElementById('split-bar-transfer');
    if(barCash) barCash.style.width = pctCash.toFixed(1) + '%';
    if(barCard) barCard.style.width = pctCard.toFixed(1) + '%';
    if(barTransfer) barTransfer.style.width = pctTransfer.toFixed(1) + '%';

    const lblCash = document.getElementById('split-pct-cash');
    const lblCard = document.getElementById('split-pct-card');
    const lblTransfer = document.getElementById('split-pct-transfer');
    if(lblCash) lblCash.textContent = `Efectivo ${pctCash.toFixed(0)}%`;
    if(lblCard) lblCard.textContent = `Tarjeta ${pctCard.toFixed(0)}%`;
    if(lblTransfer) lblTransfer.textContent = `Transf. ${pctTransfer.toFixed(0)}%`;
}

function onSplitAmountChanged(){
    updateSplitCalculation();
}

function fillSplitRemainder(method){
    const total = ticket.reduce((s,t) => s + t.price * t.qty, 0);
    if(total <= 0) return;

    let amtCash = parseFloat(document.getElementById('split-amt-cash')?.value || 0) || 0;
    let amtCard = parseFloat(document.getElementById('split-amt-card')?.value || 0) || 0;
    let amtTransfer = parseFloat(document.getElementById('split-amt-transfer')?.value || 0) || 0;

    if(method === 'cash'){
        const other = amtCard + amtTransfer;
        const rem = Math.max(0, total - other);
        document.getElementById('split-amt-cash').value = rem > 0 ? rem.toFixed(2) : '';
    } else if(method === 'card'){
        const other = amtCash + amtTransfer;
        const rem = Math.max(0, total - other);
        document.getElementById('split-amt-card').value = rem > 0 ? rem.toFixed(2) : '';
    } else if(method === 'transfer'){
        const other = amtCash + amtCard;
        const rem = Math.max(0, total - other);
        document.getElementById('split-amt-transfer').value = rem > 0 ? rem.toFixed(2) : '';
    }
    updateSplitCalculation();
}

function splitEvenly(methods){
    const total = ticket.reduce((s,t) => s + t.price * t.qty, 0);
    if(total <= 0) return;

    document.getElementById('split-amt-cash').value = '';
    document.getElementById('split-amt-card').value = '';
    document.getElementById('split-amt-transfer').value = '';

    const share = Math.floor((total / methods.length) * 100) / 100;
    let assigned = 0;

    methods.forEach((m, idx) => {
        let val;
        if(idx === methods.length - 1){
            val = Number((total - assigned).toFixed(2));
        } else {
            val = share;
            assigned += share;
        }
        const el = document.getElementById('split-amt-' + m);
        if(el) el.value = val.toFixed(2);
    });

    updateSplitCalculation();
}

function renderTicket(){
    const total = ticket.reduce((s,t)=>s+t.price*t.qty,0);
    if(ticket.length===0){
        document.getElementById('ticket-items').innerHTML='<div class="text-slate-600 text-xs text-center py-5 bg-slate-900/40 rounded-xl border border-slate-800/60">No hay productos en el ticket actual. Selecciona un producto para comenzar.</div>';
        document.getElementById('ticket-total').textContent='$0';
        updatePaymentTotals();
        return;
    }
    document.getElementById('ticket-items').innerHTML = ticket.map(t => {
            const prod = catalog.find(p => p.id === t.id);
            const tImg = t.image || (prod ? prod.image : '');
            const tImgTag = tImg 
                ? `<div class="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                       <img src="${tImg}" alt="${escapeHtml(t.name)}" class="w-full h-full object-cover">
                   </div>`
                : '';

            return `
        <div class="pos-row flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition mb-1.5 shadow-sm">
            <div class="flex items-center gap-2.5 flex-1 min-w-0 w-full sm:w-auto">
                ${tImgTag}
                <div class="flex-1 min-w-0">
                    <div class="text-xs text-white font-bold truncate" title="${t.name}">${t.name}</div>
                <div class="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span class="mono text-emerald-400 font-medium">${fmt(t.price)} c/u</span>
                    <span class="text-slate-600">·</span>
                    <span class="text-slate-300 font-semibold">Lleva: <b class="text-sky-300 font-mono">${t.qty} piezas</b></span>
                </div>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <!-- Botón explícito para modificar piezas que se van a llevar -->
                <button onclick="openModifyTicketQtyModal('${t.id}')" type="button" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-[11px] font-bold transition shadow-sm" title="Modificar número de piezas que se van a llevar (0 para quitar)">
                    <i data-lucide="edit-3" class="w-3.5 h-3.5 text-sky-400"></i><span>Modificar piezas (${t.qty})</span>
                </button>

                <!-- Control rápido de decremento / incremento -->
                <div class="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                    <button onclick="stepTicketItemDirect('${t.id}', -1)" type="button" class="w-6 h-6 rounded-md hover:bg-slate-800 text-slate-300 hover:text-rose-400 font-bold text-xs flex items-center justify-center transition" title="Quitar 1 pieza (si llega a 0 se elimina)">
                        −
                    </button>
                    <span class="text-[11px] font-bold mono text-white px-2">${t.qty}</span>
                    <button onclick="stepTicketItemDirect('${t.id}', 1)" type="button" class="w-6 h-6 rounded-md hover:bg-slate-800 text-slate-300 hover:text-emerald-400 font-bold text-xs flex items-center justify-center transition" title="Agregar 1 pieza">
                        +
                    </button>
                </div>

                <div class="text-xs mono text-emerald-400 font-bold min-w-[70px] text-right">
                    ${fmt(t.price * t.qty)}
                </div>

                <!-- Botón quitar directo -->
                <button onclick="removeTicketItem('${t.id}')" type="button" class="text-slate-500 hover:text-rose-400 transition p-1 rounded-lg hover:bg-rose-500/10" title="Quitar este producto del ticket">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
            </div>
        </div>`;
    }).join('');
    document.getElementById('ticket-total').textContent=fmt(total);
    updatePaymentTotals();
    lucide.createIcons();
}

function closeSale(){
    if(!hasPermission('pos.sell')){
        showAccessDeniedModal('Tu rol no tiene autorización para realizar cobros o registrar ventas.');
        return;
    }
    if(ticket.length===0){alert('El ticket está vacío. Agrega al menos un producto para cobrar.');return;}

    // Verify stock before closing sale
    for(const it of ticket){
        const prod = catalog.find(p => p.id === it.id);
        if(!prod || (prod.stock || 0) < it.qty){
            alert(`⛔ Error: Stock insuficiente para "${it.name}". Existencias actuales: ${prod ? prod.stock : 0} u.`);
            return;
        }
    }

    const total = ticket.reduce((s,t)=>s+t.price*t.qty,0);
    const totalCost = ticket.reduce((s,t)=>s+t.cost*t.qty,0);

    // Validate payment method
    let paymentData = {
        method: currentPaymentMethod,
        label: 'Efectivo',
        total: total,
        cash: 0,
        card: 0,
        transfer: 0
    };

    if(currentPaymentMethod === 'cash'){
        const recInput = document.getElementById('cash-received');
        const received = recInput ? parseFloat(recInput.value) : NaN;
        const change = (!isNaN(received) && received >= total) ? (received - total) : 0;
        paymentData = {
            method: 'cash',
            label: 'Efectivo',
            total: total,
            cash: total,
            card: 0,
            transfer: 0,
            cashReceived: !isNaN(received) ? received : total,
            change: change
        };
    } else if(currentPaymentMethod === 'card'){
        const ref = document.getElementById('card-ref')?.value.trim() || '';
        paymentData = {
            method: 'card',
            label: 'Tarjeta',
            total: total,
            cash: 0,
            card: total,
            transfer: 0,
            reference: ref
        };
    } else if(currentPaymentMethod === 'transfer'){
        const ref = document.getElementById('transfer-ref')?.value.trim() || '';
        paymentData = {
            method: 'transfer',
            label: 'Transferencia',
            total: total,
            cash: 0,
            card: 0,
            transfer: total,
            reference: ref
        };
    } else if(currentPaymentMethod === 'split'){
        const amtCash = parseFloat(document.getElementById('split-amt-cash')?.value || 0) || 0;
        const amtCard = parseFloat(document.getElementById('split-amt-card')?.value || 0) || 0;
        const amtTransfer = parseFloat(document.getElementById('split-amt-transfer')?.value || 0) || 0;
        const sum = amtCash + amtCard + amtTransfer;

        if(Math.abs(sum - total) > 0.05){
            alert(`⚠️ Error en Dividir Pago:\nLa suma de los métodos de pago ($${sum.toFixed(2)}) no coincide con el total del ticket ($${total.toFixed(2)}).\n\nDiferencia pendiente: $${(total - sum).toFixed(2)}\nPor favor asigna el monto exacto antes de cobrar.`);
            return;
        }

        paymentData = {
            method: 'split',
            label: 'Dividido',
            total: total,
            cash: amtCash,
            card: amtCard,
            transfer: amtTransfer,
            breakdown: `Efec: $${amtCash.toFixed(2)} | Tarj: $${amtCard.toFixed(2)} | Transf: $${amtTransfer.toFixed(2)}`
        };
    }

    // Deduct stock from catalog
    ticket.forEach(it => {
        const prod = catalog.find(p => p.id === it.id);
        if(prod){
            prod.stock = Math.max(0, (prod.stock || 0) - it.qty);
        }
    });
    if (window.FirebaseService && window.FirebaseService.products) {
        for (const it of ticket) {
            const pr = catalog.find(p => p.id === it.id);
            if (pr) window.FirebaseService.products.updateStock(it.id, pr.stock).catch(console.warn);
        }
    }

    // Validar turno de caja antes de registrar (o auto-iniciar si no hay)
    if(!currentShift || currentShift.status !== 'open'){
        currentShift = {
            id: 'sh_' + Date.now(),
            openedAt: new Date().toISOString(),
            closedAt: null,
            cashierId: currentUser ? currentUser.id : 'usr_caja',
            cashierUsername: currentUser ? currentUser.username : 'caja_demo',
            cashierName: currentUser ? currentUser.name : 'Cajero',
            initialCashFloat: 500,
            status: 'open'
        };
        localStorage.setItem('pos_current_shift', JSON.stringify(currentShift));
    }

    const subtotalCalc = total / (1 + currentTaxZoneRate);
    const taxAmountCalc = total - subtotalCalc;

    const sale={
        id:'s_'+Date.now(),
        date:new Date().toISOString(),
        items:ticket.map(t=>({...t})),
        total:total,
        subtotal:subtotalCalc,
        taxRate:currentTaxZoneRate,
        taxAmount:taxAmountCalc,
        totalCost:totalCost,
        payment:paymentData,
        shiftId:currentShift.id,
        status: 'completed',
        cashierId: currentUser ? currentUser.id : 'usr_caja',
        cashierUsername: currentUser ? currentUser.username : 'caja_demo',
        cashierName: currentUser ? currentUser.name : 'Cajero'
    };

    logActivity('Venta Registrada', `Venta cobrada por ${fmt(total)} (${paymentData.label}) por @${sale.cashierUsername}`, 'success');

    salesLog.unshift(sale);
    if (window.FirebaseService && window.FirebaseService.sales) {
        window.FirebaseService.sales.create(sale).catch(console.warn);
    }
    const justCreatedSaleId = sale.id;

    // Reset ticket & inputs
    ticket=[];
    if(document.getElementById('cash-received')) document.getElementById('cash-received').value = '';
    if(document.getElementById('card-ref')) document.getElementById('card-ref').value = '';
    if(document.getElementById('transfer-ref')) document.getElementById('transfer-ref').value = '';
    if(document.getElementById('split-amt-cash')) document.getElementById('split-amt-cash').value = '';
    if(document.getElementById('split-amt-card')) document.getElementById('split-amt-card').value = '';
    if(document.getElementById('split-amt-transfer')) document.getElementById('split-amt-transfer').value = '';
    setPaymentMethod('cash');

    renderTicket();
    renderCatalog();
    updateProductSelect();
    upPosSummary();
    upPosStats();
    onSellProductChange();
    updateShiftUI();
    
    // Auto-ofrecer impresión térmica
    setTimeout(() => {
        if(confirm(`✓ Venta registrada con éxito (#${justCreatedSaleId}) por ${fmt(sale.total)}.\n¿Deseas imprimir el Ticket Térmico ahora?`)){
            printSaleTicket(justCreatedSaleId);
        }
    }, 150);
}

function addExpense(){
    if(!hasPermission('inventory.adjust') && !hasPermission('catalog.edit') && !hasPermission('sales.approve_cancel')){
        showAccessDeniedModal('Solo un Supervisor o Administrador puede registrar gastos operativos.');
        return;
    }
    const desc=document.getElementById('exp-desc').value.trim();
    const amount=parseFloat(document.getElementById('exp-amount').value);
    const cat=document.getElementById('exp-cat').value;
    if(!desc||isNaN(amount)){alert('Completa los campos.');return;}
    expenses.push({id:'e_'+Date.now(),date:new Date().toISOString(),desc,amount,category:cat});
    localStorage.setItem('pos_expenses',JSON.stringify(expenses));
    logActivity('Gasto Registrado', `Gasto de ${fmt(amount)} (${desc}) registrado por @${currentUser ? currentUser.username : 'sistema'}`, 'warn');
    document.getElementById('exp-desc').value='';document.getElementById('exp-amount').value='';
    renderExpenses();upPosSummary();
}

function renderExpenses(){
    const today=new Date().toDateString();
    const todayExp=expenses.filter(e=>new Date(e.date).toDateString()===today);
    if(todayExp.length===0){document.getElementById('exp-list').innerHTML='<div class="text-slate-600 text-sm text-center py-6">Sin gastos hoy.</div>';return;}
    document.getElementById('exp-list').innerHTML=todayExp.map(e=>`<div class="pos-row"><div class="flex-1"><div class="text-sm text-white">${e.desc}</div><div class="text-[10px] text-slate-500">${e.category==='fijo'?'Gasto Fijo':e.category==='variable'?'Gasto Variable':'Otro'}</div></div><div class="text-sm mono text-rose-400">${fmt(e.amount)}</div></div>`).join('');
}

function upPosSummary(){
    const today = new Date().toDateString();
    const isCajero = currentUser && currentUser.role === 'cajero';
    const canViewAll = hasPermission('sales.view_all');
    const canViewFinance = hasPermission('finance.view_analysis');
    const canDirectCancel = hasPermission('sales.cancel_direct');
    const canRequestCancel = hasPermission('sales.request_cancel');

    // 1. Filtrar ventas activas (excluir canceladas para cómputos financieros)
    const activeSales = salesLog.filter(s => s.status !== 'cancelled');

    // Si es cajero, solo totaliza y lista sus propias ventas del turno
    const relevantActiveSales = (isCajero && !canViewAll)
        ? activeSales.filter(s => new Date(s.date).toDateString() === today && (s.cashierId === currentUser.id || s.cashierUsername === currentUser.username))
        : activeSales.filter(s => new Date(s.date).toDateString() === today);

    // Historial para visualización (incluye canceladas con su distintivo)
    const relevantHistorySales = (isCajero && !canViewAll)
        ? salesLog.filter(s => new Date(s.date).toDateString() === today && (s.cashierId === currentUser.id || s.cashierUsername === currentUser.username))
        : salesLog.filter(s => new Date(s.date).toDateString() === today);

    const todayExp = expenses.filter(e => new Date(e.date).toDateString() === today);
    const totalSales = relevantActiveSales.reduce((s, x) => s + x.total, 0);
    const totalCogs = relevantActiveSales.reduce((s, x) => s + x.totalCost, 0);
    const totalExp = todayExp.reduce((s, x) => s + x.amount, 0);
    const profit = totalSales - totalCogs - totalExp;

    // Actualizar tarjetas resumen
    document.getElementById('pos-sales-total').textContent = fmt(totalSales);

    const cogsEl = document.getElementById('pos-cogs');
    const profitEl = document.getElementById('pos-profit');

    if(canViewFinance){
        if(cogsEl) cogsEl.textContent = fmt(totalCogs);
        if(profitEl){
            profitEl.textContent = fmt(profit);
            profitEl.className = 'text-xl font-bold mono ' + (profit > 0 ? 'text-emerald-400' : profit === 0 ? 'text-slate-400' : 'text-rose-400');
        }
    } else {
        if(cogsEl) cogsEl.textContent = '— (Confidencial)';
        if(profitEl){
            profitEl.textContent = '— (Confidencial)';
            profitEl.className = 'text-sm font-semibold mono text-slate-500';
        }
    }

    const expEl = document.getElementById('pos-exp-total');
    if(expEl) expEl.textContent = canViewFinance ? fmt(totalExp) : '—';

    // Desglose de Métodos de Pago (solo ventas activas)
    let todayCash = 0, todayCard = 0, todayTransfer = 0;
    relevantActiveSales.forEach(s => {
        if(s.payment){
            todayCash += (s.payment.cash || 0);
            todayCard += (s.payment.card || 0);
            todayTransfer += (s.payment.transfer || 0);
        } else {
            todayCash += (s.total || 0);
        }
    });

    const payCashEl = document.getElementById('pos-pay-cash');
    const payCardEl = document.getElementById('pos-pay-card');
    const payTransferEl = document.getElementById('pos-pay-transfer');
    if(payCashEl) payCashEl.textContent = fmt(todayCash);
    if(payCardEl) payCardEl.textContent = fmt(todayCard);
    if(payTransferEl) payTransferEl.textContent = fmt(todayTransfer);

    const cashPctEl = document.getElementById('pos-pay-cash-pct');
    const cardPctEl = document.getElementById('pos-pay-card-pct');
    const transferPctEl = document.getElementById('pos-pay-transfer-pct');
    if(cashPctEl) cashPctEl.textContent = totalSales > 0 ? ((todayCash / totalSales) * 100).toFixed(0) + '%' : '0%';
    if(cardPctEl) cardPctEl.textContent = totalSales > 0 ? ((todayCard / totalSales) * 100).toFixed(0) + '%' : '0%';
    if(transferPctEl) transferPctEl.textContent = totalSales > 0 ? ((todayTransfer / totalSales) * 100).toFixed(0) + '%' : '0%';

    // Historial del Día con badges de pago, cancelación y estado
    if(relevantHistorySales.length === 0){
        document.getElementById('pos-history').innerHTML = `<div class="text-slate-600 text-sm text-center py-6">${isCajero ? 'No tienes ventas registradas en tu turno de hoy.' : 'Sin ventas registradas hoy.'}</div>`;
    } else {
        document.getElementById('pos-history').innerHTML = relevantHistorySales.map((s, i) => {
            const isCancelled = s.status === 'cancelled';
            const hasPendingReq = cancelRequests.some(r => r.saleId === s.id && r.status === 'pending');

            let payBadge = '';
            const p = s.payment || { method: 'cash', label: 'Efectivo' };
            if(p.method === 'cash'){
                payBadge = `<span class="pill bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] shrink-0 flex items-center gap-1"><i data-lucide="banknote" class="w-2.5 h-2.5 text-emerald-400"></i>Efectivo</span>`;
            } else if(p.method === 'card'){
                payBadge = `<span class="pill bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[9px] shrink-0 flex items-center gap-1"><i data-lucide="credit-card" class="w-2.5 h-2.5 text-sky-400"></i>Tarjeta${p.reference ? ' (' + p.reference + ')' : ''}</span>`;
            } else if(p.method === 'transfer'){
                payBadge = `<span class="pill bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[9px] shrink-0 flex items-center gap-1"><i data-lucide="smartphone" class="w-2.5 h-2.5 text-purple-400"></i>Transf.${p.reference ? ' (' + p.reference + ')' : ''}</span>`;
            } else if(p.method === 'split'){
                const det = [];
                if(p.cash > 0) det.push(`Efec: $${p.cash.toFixed(0)}`);
                if(p.card > 0) det.push(`Tarj: $${p.card.toFixed(0)}`);
                if(p.transfer > 0) det.push(`Transf: $${p.transfer.toFixed(0)}`);
                payBadge = `<span class="pill bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] shrink-0 flex items-center gap-1" title="${p.breakdown || det.join(', ')}"><i data-lucide="split" class="w-2.5 h-2.5 text-amber-400"></i>Dividido</span>`;
            }

            const cashierBadge = `<span class="pill bg-slate-800 text-slate-400 border border-slate-700 text-[8.5px] font-mono">@${s.cashierUsername || 'caja'}</span>`;

            let statusBadge = '';
            let actionBtn = '';

            if(isCancelled){
                statusBadge = `<span class="pill bg-rose-500/25 text-rose-300 border border-rose-500/40 text-[9px] font-bold"><i data-lucide="ban" class="w-2.5 h-2.5"></i>CANCELADA</span>`;
            } else if(hasPendingReq){
                statusBadge = `<span class="pill bg-amber-500/20 text-amber-300 border border-amber-500/35 text-[9px] font-bold animate-pulse"><i data-lucide="clock" class="w-2.5 h-2.5"></i>Cancelación Solicitada</span>`;
            }

            const printBtn = `<button onclick="printSaleTicket('${s.id}')" class="text-slate-500 hover:text-sky-300 transition p-1 shrink-0" title="Imprimir Ticket Térmico"><i data-lucide="printer" class="w-4 h-4"></i></button>`;

            if(!isCancelled){
                if(canDirectCancel){
                    actionBtn = `${printBtn}<button onclick="promptDirectCancel('${s.id}')" class="text-slate-600 hover:text-rose-400 transition p-1 shrink-0" title="Cancelar Venta (Directa)"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`;
                } else if(canRequestCancel && !hasPendingReq){
                    actionBtn = `${printBtn}<button onclick="promptRequestCancel('${s.id}')" class="text-slate-500 hover:text-amber-400 transition p-1 shrink-0 text-[10px] flex items-center gap-0.5 border border-slate-700/60 rounded px-1.5 py-0.5 bg-slate-800/60" title="Solicitar Cancelación al Supervisor"><i data-lucide="flag" class="w-3 h-3 text-amber-400"></i>Solicitar</button>`;
                } else {
                    actionBtn = printBtn;
                }
            }

            const amountDisplay = isCancelled
                ? `<span class="text-sm mono line-through text-slate-500 mr-2 shrink-0">${fmt(s.total)}</span>`
                : `<span class="text-sm mono text-emerald-400 mr-2 shrink-0">${fmt(s.total)}</span>`;

            return `
            <div class="pos-row group ${isCancelled ? 'opacity-65 bg-slate-900/30' : ''}">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span class="text-sm text-white font-medium">Venta #${i+1}</span>
                        ${cashierBadge}
                        ${payBadge}
                        ${statusBadge}
                    </div>
                    <div class="text-[10px] text-slate-400 truncate">${(s.items||[]).map(it=>it.name+' x'+it.qty).join(', ')}</div>
                    ${isCancelled ? `<div class="text-[9.5px] text-rose-400/90 mt-0.5">Motivo anulación: ${s.cancelReason || 'Sin motivo especificado'}</div>` : ''}
                </div>
                ${amountDisplay}
                ${actionBtn}
            </div>`;
        }).join('');
    }

    lucide.createIcons();

    // Gráfica de hoy (solo productos de ventas activas)
    const productSales = {}, productCosts = {};
    relevantActiveSales.forEach(s => (s.items||[]).forEach(it => {
        productSales[it.name] = (productSales[it.name] || 0) + it.price * it.qty;
        productCosts[it.name] = (productCosts[it.name] || 0) + it.cost * it.qty;
    }));
    const labels = Object.keys(productSales);
    posChart.data.labels = labels;
    posChart.data.datasets[0].data = labels.map(l => productSales[l]);
    posChart.data.datasets[1].data = labels.map(l => canViewFinance ? productCosts[l] : 0);
    posChart.update();
}

function deleteSale(id){
    // Redirigir a cancelación directa o solicitud según permisos
    if(hasPermission('sales.cancel_direct')){
        promptDirectCancel(id);
    } else if(hasPermission('sales.request_cancel')){
        promptRequestCancel(id);
    } else {
        showAccessDeniedModal('No cuentas con permisos para cancelar ventas.');
    }
}

// ===== POS ADVANCED STATISTICS =====
let hourlyChart;
function initHourlyChart(){
    const canvas = document.getElementById('cPosHourly');
    if(!canvas) return;
    if(hourlyChart) hourlyChart.destroy();
    const hours = Array.from({length:24}, (_,i) => (i < 10 ? '0' + i : '' + i) + ':00');
    hourlyChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: hours,
            datasets: [{
                label: 'Ventas ($)',
                data: Array(24).fill(0),
                backgroundColor: Array(24).fill('rgba(14, 165, 233, 0.45)'),
                borderColor: Array(24).fill('rgba(14, 165, 233, 0.8)'),
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => 'Ventas: ' + fmt(ctx.raw)
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#64748b',
                        font: { size: 9 },
                        maxRotation: 0,
                        callback: function(val, index) {
                            return index % 3 === 0 ? hours[index] : '';
                        }
                    }
                },
                y: {
                    grid: { color: 'rgba(51, 65, 85, 0.3)' },
                    ticks: {
                        color: '#64748b',
                        font: { size: 9 },
                        callback: v => fmtS(v)
                    }
                }
            }
        }
    });
}
initHourlyChart();

function upPosStats(){
    const emptyEl = document.getElementById('stats-empty');
    const contentEl = document.getElementById('stats-content');
    
    // Filtrar estrictamente solo ventas activas (excluir canceladas)
    const activeSales = (salesLog || []).filter(s => s.status !== 'cancelled');

    if(!activeSales || activeSales.length === 0){
        if(emptyEl) emptyEl.classList.remove('hidden');
        if(contentEl) contentEl.classList.add('hidden');
        return;
    }
    if(emptyEl) emptyEl.classList.add('hidden');
    if(contentEl) contentEl.classList.remove('hidden');

    const prodMap = {};
    let totalRevenue = 0;
    const daySet = new Set();
    const hourlyRevenue = Array(24).fill(0);
    const hourlyTickets = Array(24).fill(0);

    activeSales.forEach(s => {
        daySet.add(new Date(s.date).toDateString());
        totalRevenue += (s.total || 0);

        const dateObj = new Date(s.date);
        const hr = isNaN(dateObj.getHours()) ? 12 : dateObj.getHours();
        hourlyRevenue[hr] += (s.total || 0);
        hourlyTickets[hr] += 1;

        if(s.items && Array.isArray(s.items)){
            s.items.forEach(it => {
                if(!prodMap[it.id]){
                    prodMap[it.id] = {
                        id: it.id,
                        name: it.name,
                        qty: 0,
                        revenue: 0,
                        cost: 0,
                        price: it.price || 0,
                        unitCost: it.cost || 0
                    };
                }
                prodMap[it.id].qty += it.qty;
                prodMap[it.id].revenue += (it.price * it.qty);
                prodMap[it.id].cost += (it.cost * it.qty);
            });
        }
    });

    const products = Object.values(prodMap).sort((a,b) => b.qty - a.qty);

    document.getElementById('stat-total-rev').textContent = fmt(totalRevenue);
    document.getElementById('stat-total-tickets').textContent = `${activeSales.length} ticket(s) en ${daySet.size} día(s)`;
    document.getElementById('stat-avg-ticket').textContent = fmt(activeSales.length > 0 ? totalRevenue / activeSales.length : 0);
    document.getElementById('stat-prod-count').textContent = `${products.length} producto(s)`;

    // Top Selling Product
    if(products.length > 0){
        const top = products[0];
        document.getElementById('stat-top-prod-name').textContent = top.name;
        document.getElementById('stat-top-prod-sub').textContent = `${top.qty} unid. vendidas · ${fmt(top.revenue)}`;
        const share = totalRevenue > 0 ? ((top.revenue / totalRevenue) * 100).toFixed(1) : 0;
        document.getElementById('stat-top-prod-share').textContent = `${share}% del total`;
    } else {
        document.getElementById('stat-top-prod-name').textContent = '—';
        document.getElementById('stat-top-prod-sub').textContent = '—';
        document.getElementById('stat-top-prod-share').textContent = '0%';
    }

    // Peak Hour Calculation
    let peakHr = 0, maxHrRev = 0;
    for(let h = 0; h < 24; h++){
        if(hourlyRevenue[h] > maxHrRev){
            maxHrRev = hourlyRevenue[h];
            peakHr = h;
        }
    }
    const peakEnd = (peakHr + 1) % 24;
    const peakHrStr = (peakHr < 10 ? '0' + peakHr : peakHr) + ':00 - ' + (peakEnd < 10 ? '0' + peakEnd : peakEnd) + ':00';
    document.getElementById('stat-peak-hour').textContent = peakHrStr;
    document.getElementById('stat-peak-hour-sub').textContent = `${fmt(maxHrRev)} (${hourlyTickets[peakHr]} ticket(s))`;
    const peakPct = totalRevenue > 0 ? ((maxHrRev / totalRevenue) * 100).toFixed(0) : 0;
    document.getElementById('stat-peak-hour-pct').textContent = `${peakPct}% del total`;

    // Update Hourly Chart
    if(!hourlyChart) initHourlyChart();
    if(hourlyChart){
        hourlyChart.data.datasets[0].data = hourlyRevenue;
        hourlyChart.data.datasets[0].backgroundColor = hourlyRevenue.map((v, i) => i === peakHr && v > 0 ? 'rgba(16, 185, 129, 0.85)' : 'rgba(14, 165, 233, 0.45)');
        hourlyChart.data.datasets[0].borderColor = hourlyRevenue.map((v, i) => i === peakHr && v > 0 ? '#10b981' : '#0ea5e9');
        hourlyChart.update();
    }

    // Top Selling Ranking List
    const maxQty = products.length > 0 ? products[0].qty : 1;
    const rankingHtml = products.map((p, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}`;
        const pctBar = Math.min(Math.round((p.qty / maxQty) * 100), 100);
        const marginPct = p.revenue > 0 ? ((p.revenue - p.cost) / p.revenue * 100).toFixed(0) : 0;
        const canViewCosts = hasPermission('finance.view_analysis');
        const marginOrShare = canViewCosts
            ? `<span>Margen: <b class="${marginPct >= 30 ? 'text-emerald-400' : 'text-amber-400'}">${marginPct}%</b> (${fmt(p.revenue - p.cost)})</span>`
            : `<span>Participación: <b class="text-sky-400">${totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : 0}%</b></span>`;

        return `
        <div class="pos-row flex items-center gap-3">
            <span class="w-7 text-center font-bold text-xs ${idx === 0 ? 'text-amber-400' : 'text-slate-400'}">${medal}</span>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-semibold text-white truncate">${p.name}</span>
                    <span class="text-xs font-bold mono text-emerald-400">${fmt(p.revenue)}</span>
                </div>
                <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full" style="width: ${pctBar}%"></div>
                </div>
                <div class="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>${p.qty} unid. vendidas</span>
                    ${marginOrShare}
                </div>
            </div>
        </div>`;
    }).join('');
    document.getElementById('stat-ranking-list').innerHTML = rankingHtml || '<div class="text-slate-500 text-xs py-4 text-center">No hay productos vendidos.</div>';

    renderCorrelationAnalysis(products);
    lucide.createIcons();
}

function renderCorrelationAnalysis(products){
    const container = document.getElementById('correlation-table');
    const insightsContainer = document.getElementById('correlation-insights');
    const activeSales = (salesLog || []).filter(s => s.status !== 'cancelled');
    if(!products || products.length < 2 || activeSales.length < 2){
        insightsContainer.innerHTML = '';
        container.innerHTML = '<div class="text-slate-500 text-xs py-4 text-center">Se requieren al menos 2 productos con ventas registradas activas para calcular correlaciones cruzadas.</div>';
        return;
    }

    const N = activeSales.length;
    const prodVectors = {};
    products.forEach(p => { prodVectors[p.id] = Array(N).fill(0); });

    activeSales.forEach((sale, idx) => {
        if(sale.items && Array.isArray(sale.items)){
            sale.items.forEach(it => {
                if(prodVectors[it.id]){
                    prodVectors[it.id][idx] += it.qty;
                }
            });
        }
    });

    const pairs = [];
    for(let i = 0; i < products.length; i++){
        for(let j = i + 1; j < products.length; j++){
            const pA = products[i];
            const pB = products[j];
            const vecA = prodVectors[pA.id];
            const vecB = prodVectors[pB.id];

            let sumA = 0, sumB = 0, sumAA = 0, sumBB = 0, sumAB = 0;
            for(let k = 0; k < N; k++){
                const a = vecA[k];
                const b = vecB[k];
                sumA += a;
                sumB += b;
                sumAA += a * a;
                sumBB += b * b;
                sumAB += a * b;
            }

            const numerator = (N * sumAB) - (sumA * sumB);
            const denominator = Math.sqrt((N * sumAA - sumA * sumA) * (N * sumBB - sumB * sumB));
            const r = denominator === 0 ? 0 : numerator / denominator;
            pairs.push({ pA, pB, r });
        }
    }

    pairs.sort((a,b) => Math.abs(b.r) - Math.abs(a.r));

    const strongNeg = pairs.find(p => p.r <= -0.25);
    const strongPos = pairs.find(p => p.r >= 0.25);

    let insightHtml = '';
    if(strongNeg){
        insightHtml += `
        <div class="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5 text-xs text-rose-200">
            <i data-lucide="arrow-down-right" class="w-4 h-4 text-rose-400 mt-0.5 shrink-0"></i>
            <div>
                <b class="text-rose-300">Efecto Canibalización / Sustitutos detectado (r = ${strongNeg.r.toFixed(2)}):</b> 
                El aumento en la venta de <b>${strongNeg.pA.name}</b> coincide con la disminución o ausencia de <b>${strongNeg.pB.name}</b>. Los clientes eligen uno u otro, compitiendo directamente en demanda.
            </div>
        </div>`;
    }
    if(strongPos){
        insightHtml += `
        <div class="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-2.5 text-xs text-emerald-200">
            <i data-lucide="arrow-up-right" class="w-4 h-4 text-emerald-400 mt-0.5 shrink-0"></i>
            <div>
                <b class="text-emerald-300">Productos Complementarios (Venta Cruzada, r = +${strongPos.r.toFixed(2)}):</b> 
                <b>${strongPos.pA.name}</b> y <b>${strongPos.pB.name}</b> suelen comprarse juntos en el mismo ticket. ¡Excelente oportunidad para crear un combo o paquete promocional!
            </div>
        </div>`;
    }
    if(!strongNeg && !strongPos){
        insightHtml = `
        <div class="p-2.5 rounded-lg border border-slate-700/60 bg-slate-800/40 text-xs text-slate-300 flex items-center gap-2">
            <i data-lucide="info" class="w-3.5 h-3.5 text-sky-400 shrink-0"></i>
            <span>Las ventas de tus productos muestran demanda independiente (baja correlación). Continúa registrando más tickets para detectar patrones de consumo.</span>
        </div>`;
    }
    insightsContainer.innerHTML = insightHtml;

    const pairsHtml = pairs.map(pair => {
        let badge, label, desc;
        if(pair.r <= -0.25){
            badge = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
            label = 'Sustitutos / Inversa';
            desc = 'Subir la venta de uno disminuye el otro';
        } else if(pair.r >= 0.25){
            badge = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
            label = 'Complementarios / Combo';
            desc = 'Se venden juntos habitualmente';
        } else {
            badge = 'bg-slate-700/60 text-slate-400 border border-slate-600/40';
            label = 'Independientes';
            desc = 'No afectan mutuamente su venta';
        }
        return `
        <div class="pos-row flex items-center justify-between gap-3 text-xs">
            <div class="flex-1 min-w-0">
                <div class="font-medium text-white flex items-center gap-1.5 truncate">
                    <span>${pair.pA.name}</span>
                    <i data-lucide="repeat" class="w-3 h-3 text-slate-500 shrink-0"></i>
                    <span>${pair.pB.name}</span>
                </div>
                <div class="text-[10px] text-slate-400">${desc}</div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <span class="mono font-bold text-xs ${pair.r > 0 ? 'text-emerald-400' : pair.r < 0 ? 'text-rose-400' : 'text-slate-400'}">${pair.r > 0 ? '+' : ''}${pair.r.toFixed(2)}</span>
                <span class="pill ${badge} text-[9px]">${label}</span>
            </div>
        </div>`;
    }).join('');
    container.innerHTML = pairsHtml;
    lucide.createIcons();
}

function showPosTab(t){
    // Validación estricta de permisos por pestaña en tiempo real
    if(t === 'sell' && !hasPermission('pos.sell')){
        showAccessDeniedModal('Tu rol no tiene autorización para registrar ventas.');
        return;
    }
    if(t === 'catalog' && !hasPermission('catalog.view') && !hasPermission('inventory.view')){
        showAccessDeniedModal('Tu rol no tiene autorización para consultar o gestionar el catálogo.');
        return;
    }
    if(t === 'expense' && !hasPermission('inventory.adjust') && !hasPermission('catalog.edit')){
        showAccessDeniedModal('Solo Administradores y Supervisores pueden registrar gastos operativos.');
        return;
    }
    if(t === 'users' && !hasPermission('users.manage') && !hasPermission('sales.approve_cancel') && !hasPermission('audit.view_limited')){
        showAccessDeniedModal('Tu rol no tiene acceso al módulo de seguridad, usuarios o auditoría.');
        return;
    }

    const pvAnalista = document.getElementById('pv-analista-info');
    if(pvAnalista && currentUser.role !== 'analista') pvAnalista.classList.add('hidden');

    ['catalog','sell','expense','users'].forEach(n => {
        const el = document.getElementById('pv-' + n);
        if(el) el.classList.toggle('hidden', n !== t);
        const b = document.getElementById('pt-' + n);
        if(b){
            if(n === t){
                b.classList.add('tab-on');
                b.classList.remove('text-slate-500');
            } else {
                b.classList.remove('tab-on');
                b.classList.add('text-slate-500');
            }
        }
    });

    if(t === 'sell'){
        updateProductSelect();
        onSellProductChange();
        setPaymentMethod(currentPaymentMethod);
        updatePaymentTotals();
    }
    if(t === 'catalog') renderCatalog();
    if(t === 'expense') renderExpenses();
    if(t === 'users'){
        showUsersSubSection(currentUsersSubSection || 'users');
    }
    lucide.createIcons();
}

function exportPosDB(){const db={version:'1.0.0',exported:new Date().toISOString(),catalog,sales:salesLog,expenses};dl(db,'cfo_copilot_pos_database.json');toast('pos-toast');}


