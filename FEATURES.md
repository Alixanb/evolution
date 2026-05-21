# Features

- Simulation par journées : chaque jour, les créatures cherchent, mangent, et dorment avant le passage au jour suivant
- Système de reproduction et de mortalité basé sur le score de nourriture (feedScore)
- Deux espèces avec comportements distincts : Seeker et Raider, avec une table de distribution asymétrique (le Raider vole 75% de la nourriture au Seeker)
- Localisation de nourriture par grille spatiale (SpatialGrid) : recherche en anneaux concentriques avec early-exit mathématique, évite un O(n) par créature à chaque frame
- Partage de nourriture : une même source peut nourrir jusqu'à deux créatures simultanément, avec redistribution des créatures en excès
- Effet visuel de spawn : double anneau lumineux qui se dilate et s'estompe lors de la reproduction
- Panneau de contrôle temps réel (Tweakpane) : vitesse de simulation, pause, quantité de nourriture par jour, saut de jour, graphes de population
- Inspecteur cliquable : clic sur une créature ou une nourriture affiche ses données en direct (statut, position, vitesse, cibles...)
- Boucle de jeu avec dt multiplié par la vitesse de simulation, découplé du framerate
- Grille logique 100×100 indépendante de la résolution écran, recalculée dynamiquement au resize
