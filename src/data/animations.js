// Les animations au défilement montrées en exemple. Chacune a sa page plein écran
// (/animations/<id>/) et un onglet dans la section « Vos plats, en mouvement » de l'accueil.
// Images : public/sequences/<id>/m (téléphone) et g (ordinateur), fabriquées à partir de vraies
// vidéos par marketing/kit-lancement/_sources/sequences/fabriquer.py.
export const ANIMATIONS = [
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
  {
    id: 'chocolat',
    onglet: 'Chocolat',
    sous: 'Tempérage, moulage, finition',
    titre: 'Le chocolat, du tempérage à la création',
    resume: 'Le chocolat tempéré, coulé dans le moule, raclé d’un geste : le travail de l’atelier, au rythme du doigt. Pour un vrai client, nous filmons ses mains et ses créations.',
    apercu: '/sequences/chocolat/g/120.webp',
    images: 212,
    credit: 'Images : Pexels, licence Pexels. Extraits recadrés et enchaînés.',
    creditLien: 'https://www.pexels.com/search/videos/chocolatier/',
  },
];
