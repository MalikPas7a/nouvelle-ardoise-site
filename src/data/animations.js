// Les animations au défilement montrées en exemple. Chacune a sa page plein écran
// (/animations/<id>/) et un onglet dans la section « Vos plats, en mouvement » de l'accueil.
// Images : public/sequences/<id>/<taille>/001.webp…
export const ANIMATIONS = [
  {
    id: 'kebab',
    onglet: 'Kebab',
    sous: 'Vraies images, filmées',
    titre: 'De la broche à l’emballage',
    resume: 'La broche, la garniture, le pain, puis le kebab emballé : tout avance au rythme du doigt. Pour un vrai client, nous filmons sa broche à lui.',
    apercu: '/sequences/kebab/g/100.webp',
    images: 153,
    tailles: 'm,g',
    couvre: true,
    credit: 'Images : ZACK, « Kebab Traditionnel vs Kebab Berliner », Wikimedia Commons, licence CC BY 3.0. Extraits recadrés et enchaînés.',
    creditLien: 'https://commons.wikimedia.org/wiki/File:Kebab_Traditionnel_vs_Kebab_Berliner_-_O%C3%B9_est_l%E2%80%99arnaque_-_(Avec_@BRleGourmand_).webm',
  },
  {
    id: 'pizza',
    onglet: 'Pizza',
    sous: 'Animation 3D',
    titre: 'La pizza s’assemble au feu de bois',
    resume: 'La pâte, la sauce, la mozzarella, le basilic : chaque ingrédient se pose à son tour pendant que le visiteur fait défiler.',
    apercu: '/sequences/pizza/g/001.webp',
    images: 96,
    tailles: 'm,g,x',
  },
  {
    id: 'sushi',
    onglet: 'Sushi',
    sous: 'Animation 3D',
    titre: 'Le maki s’ouvre',
    resume: 'Le maki se décompose et révèle chaque ingrédient : le saumon, l’avocat, le concombre, le riz et l’algue.',
    apercu: '/sequences/sushi/g/072.webp',
    images: 96,
    tailles: 'm,g,x',
  },
];
