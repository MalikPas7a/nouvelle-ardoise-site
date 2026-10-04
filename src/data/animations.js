// Les animations au défilement montrées en exemple. Chacune a sa page plein écran
// (/animations/<id>/) et un onglet dans la section « Vos plats, en mouvement » de l'accueil.
// Images : public/sequences/<id>/m (téléphone) et g (ordinateur), fabriquées à partir de vraies
// vidéos par marketing/kit-lancement/_sources/sequences/fabriquer.py.
export const ANIMATIONS = [
  {
    id: 'kebab',
    onglet: 'Kebab',
    sous: 'Broche, pain, emballage',
    titre: 'De la broche à l’emballage',
    resume: 'La broche, la garniture, le pain, puis le kebab emballé : tout avance au rythme du doigt. Pour un vrai client, nous filmons sa broche à lui.',
    apercu: '/sequences/kebab/g/100.webp',
    images: 153,
    credit: 'Images : ZACK, « Kebab Traditionnel vs Kebab Berliner », Wikimedia Commons, licence CC BY 3.0. Extraits recadrés et enchaînés.',
    creditLien: 'https://commons.wikimedia.org/wiki/File:Kebab_Traditionnel_vs_Kebab_Berliner_-_O%C3%B9_est_l%E2%80%99arnaque_-_(Avec_@BRleGourmand_).webm',
  },
  {
    id: 'pizza',
    onglet: 'Pizza',
    sous: 'Pâte, sauce, four',
    titre: 'La pizza, de la pâte au four',
    resume: 'La pâte étalée à la main, la sauce, le fromage, le four : chaque étape avance au rythme du doigt. Avec la carte des pizzas et l’origine des produits.',
    apercu: '/sequences/pizza/g/200.webp',
    images: 221,
    credit: 'Images : Mixkit, licence gratuite Mixkit. Extraits recadrés et enchaînés.',
    creditLien: 'https://mixkit.co/free-stock-video/pizza/',
  },
  {
    id: 'sushi',
    onglet: 'Sushi',
    sous: 'Riz, saumon, dressage',
    titre: 'Le maki, du riz à l’assiette',
    resume: 'Le riz étalé sur la natte, le saumon posé à la main, puis le dressage : le geste du chef, au rythme du doigt.',
    apercu: '/sequences/sushi/g/170.webp',
    images: 192,
    credit: 'Images : Pexels, licence Pexels. Extraits recadrés et enchaînés.',
    creditLien: 'https://www.pexels.com/search/videos/sushi%20chef/',
  },
];
