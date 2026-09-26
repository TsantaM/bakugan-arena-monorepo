# Profondeur stratégique : 27 nouvelles capacités exclusives

Note de conception de la passe qui donne une capacité exclusive à chaque Bakugan
du jeu. Pour **écrire** une carte, voir
[`EXCLUSIVE-ABILITIES.md`](./EXCLUSIVE-ABILITIES.md) ; pour les mécaniques de
statut, [`BAKUGAN-STATUSES.md`](./BAKUGAN-STATUSES.md).

---

## Le diagnostic

Le problème n'était pas le nombre de cartes — il y en avait 66 — mais leur
répartition. Sur ces 66 capacités exclusives :

| Archétype | Cartes | État |
| --- | --- | --- |
| `+X G` sec | ~22 | saturé |
| Annuler / bloquer une carte portail | ~9 | saturé |
| Transfert ou drain de puissance | ~7 | correct |
| Déplacement | ~6 | correct |
| Blocage de capacités | ~5 | correct |
| Élimination directe | ~5 | correct |
| Protection | 2 | sous-exploité |

Un tiers des cartes faisaient donc la même chose : ajouter de la puissance. Et
**17 Bakugan enregistrés n'avaient aucune capacité exclusive** — dont Ventus
Oberus, un Soldat Légendaire à 500 Gs, alors que les cinq autres Légendaires en
avaient tous une.

Des axes entiers étaient absents : l'information, l'économie de tour, la gestion
de ressources, la redirection, le reflet, la remise à plat, le risque-récompense
et l'usure sur plusieurs tours — alors même que le statut `poisoned` existait
déjà dans le type sans être lu nulle part.

---

## Ce qui a été ajouté au moteur

Les cartes ci-dessous n'auraient pas été exprimables avec les primitives
existantes. Cinq statuts et deux mécaniques de durée ont été ajoutés ; le détail
est dans [`BAKUGAN-STATUSES.md`](./BAKUGAN-STATUSES.md).

| Ajout | Permet |
| --- | --- |
| `powerLocked` | l'immunité totale aux variations de puissance |
| `guardian` | la redirection des malus vers un protecteur |
| `reflectMalus` | la conversion d'un malus en bonus |
| `banished` | le retrait définitif, insensible aux réanimations |
| `markedForDeath` | la condamnation différée, résolue à la victoire |
| Tick de poison | l'usure tour après tour (branche enfin `poisoned`) |
| `slot.setLock` | la condamnation temporaire d'un emplacement |

---

## Les 17 cartes pour les Bakugan qui n'avaient rien

| Bakugan | Carte | Effet | Axe |
| --- | --- | --- | --- |
| **Ventus Oberus** (500) | Souffle de la Vie Verte | Rend utilisables les capacités exclusives déjà consommées par les alliés encore en jeu | Ressources *(inédit)* |
| **Pyrus Falconeer** (370) | Piqué Incendiaire | Se déplace sur une autre carte portail ; l'adversaire le plus faible y perd 100 Gs | Tempo |
| **Ventus Falconeer** (370) | Rapace Éclaireur | Révèle le nombre de capacités restantes de la cible, puis la réduit au silence | Information *(inédit)* |
| **Pyrus Saurus** (370) | Rage Sismique | +50 Gs, +50 par allié éliminé (max +200) | Remontada |
| **Subterra Saurus** (370) | Carapace Têtue | Puissance verrouillée : aucun malus, mais aucun bonus | Contre-méta *(inédit)* |
| **Haos Saurus** (370) | Cri de Ralliement | Appelle un renfort avec +100 Gs, +200 si même famille | Renfort |
| **Haos Siege** (380) | Serment du Gardien | Encaisse à la place de ses alliés du même emplacement | Redirection *(inédit)* |
| **Darkus Siege** (380) | Lame Usurpatrice | Rejoue à son profit la dernière capacité adverse du combat | Réactif |
| **Darkus Stinglash** (350) | Venin Rampant | Empoisonne : −50 Gs à chaque changement de tour | Usure *(inédit)* |
| **Subterra Stinglash** (350) | Étreinte de Pierre | La cible ne peut plus bouger, son emplacement ne peut plus être annulé | Verrouillage |
| **Darkus Wormquake** (350) | Galerie d'Ombre | Quitte le combat sans être éliminé, ressort à côté, annule l'emplacement quitté | Évasion |
| **Aquos Garganoid** (380) | Contre-Courant | Retire le double du bonus accumulé par chaque adversaire de l'emplacement | Punition anti-bonus |
| **Aquos Diablo** (420) | Pacte Sanglant | +200 Gs, mais retiré définitivement du jeu en cas de défaite | Risque *(inédit)* |
| **Aquos Angelo** (420) | Grâce Salvatrice | Un allié vaincu retourne en main au lieu d'être éliminé | Assurance |
| **Pyrus Warius** (430) | Brise-Muraille | Annule la carte portail et condamne l'emplacement 2 tours | Zone denial |
| **Aquos Warius** (430) | Ancre Abyssale | Draine 50 Gs à chaque adversaire du terrain | Drain scalant |
| **Darkus Warius** (430) | Verdict du Bourreau | Condamne une cible n'importe où : éliminée si le lanceur gagne | Menace à distance |

Diablo et Angelo forment volontairement un couple : même structure, intentions
opposées (le pari contre le filet de sécurité), jusque dans leurs animations qui
n'opposent que leur palette.

## Les 9 cartes utilitaires

Ces Bakugan avaient déjà une carte, mais c'était un `+X G` sec. Une **seconde**
carte leur a été ajoutée plutôt que de remplacer la première — remplacer aurait
cassé les decks déjà construits.

| Bakugan | Carte existante | Carte ajoutée | Effet |
| --- | --- | --- | --- |
| **Pyrus Apollonir** | Maximum Pyrus (+200) | Jugement du Légendaire | Annule toutes les capacités actives de l'emplacement, des deux camps |
| **Ventus Skyress Tempête** | Assaut Météorique (+200) | Œil du Cyclone | Renvoie tout le monde en main, retire la carte portail, annule le combat |
| **Ventus Harpus** | Tempête de Plumes (+100) | Rafale Ascendante | Renvoie l'adversaire le plus faible en main, sans l'éliminer |
| **Pyrus Siege** | Épée de Feu (+100) | Brasier de Siège | −50 Gs à tous les Bakugan de l'emplacement, alliés compris |
| **Aquos Juggernoid** | Tornade Déchaînée (+100) | Carapace Réfléchissante | Le prochain malus devient un bonus |
| **Manion** ×3 | Amun Ra (+100) | Énigme du Sphinx | L'adversaire ne peut poser aucun Bakugan au tour suivant |
| **Aquos Stinglash** | Maître des Profondeurs (+100) | Marée Corrosive | −50 Gs aux adversaires de l'emplacement, empoisonne le plus fort |
| **Robotallion** ×4 | Exécution (+50) | Protocole d'Escorte | Adopte la puissance de base du meilleur allié du terrain |
| **Fear Ripper** ×4 | Attaque Zéro (+50) | Griffes Affamées | +50 Gs, +100 par adversaire déjà éliminé |

Rage Sismique et Griffes Affamées sont symétriques : l'une récompense celui qui
encaisse, l'autre celui qui a déjà frappé.

## La carte persistante : Moisson des Âmes

| Bakugan | Carte existantes | Carte ajoutée | Effet |
| --- | --- | --- | --- |
| **Darkus Reaper** | Dimension Quatre, Faucheur du Chaos | Moisson des Âmes | +100 Gs par allié éliminé, +50 Gs par adversaire éliminé |

Elle appartient à la même famille que Griffes Affamées — se nourrir du
cimetière — mais avec une propriété qu'aucune autre carte du jeu n'a : **la part
venant des alliés est persistante**.

Un Bakugan reposé sur le terrain revient toujours à sa puissance de base
(`bakuganData.currentPowerLevel` est figé à la création de la partie). Pour la
plupart des cartes, quitter le terrain efface donc tout. Moisson des Âmes
s'enregistre dans `persistantAbilities` et, via `onUserSet`, rend à Reaper la
moisson de ses propres morts à chaque retour — **recalculée** sur le cimetière
du moment, donc plus grosse si des alliés sont tombés pendant son absence. La
part arrachée à l'adversaire, elle, ne revient pas : c'était le butin d'une
seule fauche.

Conséquence de conception : c'est la seule carte dont le bonus se reconstruit
tout seul, et elle transforme les pertes du joueur en ressource. Un Reaper qui
fait des allers-retours sur un terrain où ses alliés tombent devient de plus en
plus lourd — d'où le `maxInDeck: 1` et l'activation réservée au combat.

**Comptabilité.** Le montant appliqué change à chaque retour, alors
`onCanceled` doit reprendre le montant *courant*, pas celui de l'activation. La
carte tient donc un compteur dans son enregistrement persistant (`fusion` sert
de bloc-notes, voir [`EXCLUSIVE-ABILITIES.md`](./EXCLUSIVE-ABILITIES.md#oncanceled--défaire-exactement-ce-qui-a-été-fait)),
réécrit à chaque application.

---

## Intentions d'équilibrage

**Les cartes qui ouvrent un axe inédit sont en `maxInDeck: 1`.** Souffle de la
Vie Verte, Serment du Gardien, Pacte Sanglant, Verdict du Bourreau, Jugement du
Légendaire, Carapace Têtue, Œil du Cyclone : une seule par deck.

**Chaque carte forte a une clause de nullité.** Contre-Courant ne fait rien
contre un adversaire sans bonus ; Lame Usurpatrice ne fait rien si l'adversaire
n'a rien activé ; Jugement du Légendaire ne fait rien sur un emplacement sans
capacité active ; Protocole d'Escorte ne fait rien sans allié plus puissant.
C'est ce qui les empêche d'être des inclusions automatiques.

**Les effets symétriques coûtent quelque chose.** Brasier de Siège brûle les
alliés, Œil du Cyclone renvoie aussi les siens, Jugement du Légendaire efface
aussi ses propres bonus, Carapace Têtue refuse les bonus en échange de
l'immunité. Aucun de ces coûts n'est cosmétique.

**Les cartes de comptage sont plafonnées ou bornées.** Rage Sismique plafonne à
+200. Contre-Courant n'est pas plafonné — c'est délibéré, c'est la réponse aux
cartes Personnage qui doublent la puissance, et elle est limitée à un exemplaire.

---

## Corrections de passage

- `regain-subit` et `souffle-infini` sont réenregistrés : Darkus Centipod et
  Ventus El Condor pointaient vers des clés absentes du registre.
- L'entrée `RobotallionExecution` dupliquée dans `ExclusiveAbilities` est
  supprimée.
- La clé `'cape de feu'` (avec espaces, seule clé non kebab-case du projet)
  **n'a pas été renommée** : les decks persistés en base stockent cette chaîne.
  C'est une migration de données, pas un nettoyage de code.

---

## État de vérification

Typecheck vert sur les cinq paquets. **55 assertions de comportement** passées
sur un `stateType` réel : verrouillage bidirectionnel, redirection du gardien,
conversion puis consommation du reflet, double retrait du Contre-Courant, deux
ticks de poison successifs, expiration du verrou de Brise-Muraille au bon tour,
exécution du Verdict, levée du bannissement à la victoire, et pour Moisson des
Âmes le cycle complet activation → retrait → repose → annulation.

Trois régressions d'annulation ont été trouvées **par ces tests et par elles
seules** — le typage ne les voyait pas : Souffle de la Vie Verte reconsommait
des capacités jamais dépensées, Rapace Éclaireur libérait les Bakugan muselés
par d'autres cartes, Énigme du Sphinx pouvait rouvrir la pose en plein combat.
Le harnais était jetable et n'est pas dans l'arbre ; la leçon, elle, est dans
[`EXCLUSIVE-ABILITIES.md`](./EXCLUSIVE-ABILITIES.md#oncanceled--défaire-exactement-ce-qui-a-été-fait).

**Ce qui reste à vérifier :** rien de tout cela n'a tourné dans une vraie
partie. Les animations en particulier ne sont validées que par le typage et la
composition — leur rendu mérite un passage par l'Animation Lab.
