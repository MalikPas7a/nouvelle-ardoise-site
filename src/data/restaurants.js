// Les trois restaurants de démonstration. Ils sont inventés : aucun n'existe.
// Chaque plat : nom, description, prix en CHF, et éventuellement des étiquettes
// (vege, epice) et une traduction anglaise.
export const RESTAURANTS = [
  {
    id: 'osteria',
    nom: 'Osteria del Lago',
    genre: 'Trattoria',
    quartier: 'Eaux-Vives',
    accroche: 'Pâtes fraîches roulées chaque matin, au bord du lac.',
    horaires: 'Ouvert ce soir jusqu’à 22 h 30',
    montre: 'Site immersif et plat en 3D',
    carte: [
      { titre: 'Antipasti', plats: [
        { nom: 'Burrata, tomates anciennes', desc: 'Huile d’olive des Pouilles, basilic', prix: 16, vege: true },
        { nom: 'Vitello tonnato', desc: 'Veau rosé, câpres, sauce au thon', prix: 19 },
      ] },
      { titre: 'Pasta', plats: [
        { nom: 'Tagliatelle al ragù', desc: 'Bœuf et porc mijotés six heures', prix: 24, photo: 'ragu' },
        { nom: 'Linguine al pesto', desc: 'Basilic, pignons, pecorino', prix: 22, vege: true, photo: 'pesto' },
        { nom: 'Spaghetti al pomodoro', desc: 'Tomates San Marzano, ail, basilic', prix: 19, vege: true, photo: 'pomodoro' },
      ] },
      { titre: 'Dolci', plats: [
        { nom: 'Tiramisù', desc: 'Mascarpone, café serré, cacao', prix: 11 },
        { nom: 'Panna cotta', desc: 'Coulis de fruits rouges', prix: 10 },
      ] },
    ],
  },
  {
    id: 'leonie',
    nom: 'Chez Léonie',
    genre: 'Bistrot de quartier',
    quartier: 'Carouge',
    accroche: 'La cuisine de bistrot, le marché du matin, l’ardoise du jour.',
    horaires: 'Service de midi jusqu’à 14 h',
    montre: 'Ardoise du jour modifiable',
    carte: [
      { titre: 'Entrées', plats: [
        { nom: 'Œuf mayonnaise', desc: 'Œufs de la ferme, mayonnaise maison', prix: 9, vege: true },
        { nom: 'Poireaux vinaigrette', desc: 'Noisettes torréfiées, cerfeuil', prix: 12, vege: true },
        { nom: 'Malakoff', desc: 'Beignet de gruyère, cornichons', prix: 14, vege: true },
      ] },
      { titre: 'Plats', plats: [
        { nom: 'Filets de perche meunière', desc: 'Frites maison, sauce tartare', prix: 36 },
        { nom: 'Saucisse à rôtir', desc: 'Lentilles vertes, moutarde à l’ancienne', prix: 26 },
        { nom: 'Tartare coupé au couteau', desc: 'Bœuf suisse, toasts, salade', prix: 32 },
      ] },
      { titre: 'Desserts', plats: [
        { nom: 'Meringue, double crème', desc: 'Crème de la Gruyère', prix: 11 },
        { nom: 'Tarte Tatin', desc: 'Servie tiède', prix: 12 },
      ] },
    ],
  },
  {
    id: 'sora',
    nom: 'Sora',
    genre: 'Comptoir à ramen',
    quartier: 'Plainpalais',
    accroche: 'Bouillons de douze heures, nouilles faites sur place.',
    horaires: 'Ouvert jusqu’à 23 h',
    montre: 'Carte filtrable, en deux langues',
    carte: [
      { titre: 'Ramen', en: 'Ramen', plats: [
        { nom: 'Shoyu', desc: 'Bouillon de volaille, soja, porc chashu, œuf mollet', en: 'Chicken broth, soy, chashu pork, soft egg', prix: 23 },
        { nom: 'Miso épicé', nomEn: 'Spicy miso', desc: 'Miso rouge, porc haché, piment, maïs', en: 'Red miso, minced pork, chilli, corn', prix: 25, epice: true },
        { nom: 'Shio yuzu', desc: 'Bouillon clair, yuzu, poulet, pousses de bambou', en: 'Clear broth, yuzu, chicken, bamboo shoots', prix: 24 },
        { nom: 'Végétal au sésame', nomEn: 'Sesame veggie', desc: 'Lait de sésame, shiitaké, tofu grillé', en: 'Sesame milk, shiitake, grilled tofu', prix: 22, vege: true },
        { nom: 'Tantan végétal', nomEn: 'Veggie tantan', desc: 'Sésame, huile pimentée, protéines de soja', en: 'Sesame, chilli oil, soy mince', prix: 23, vege: true, epice: true },
      ] },
      { titre: 'Petites assiettes', en: 'Small plates', plats: [
        { nom: 'Gyoza au porc', nomEn: 'Pork gyoza', desc: 'Cinq pièces, grillées', en: 'Five pieces, pan-fried', prix: 12 },
        { nom: 'Karaage', desc: 'Poulet frit, mayonnaise au yuzu', en: 'Fried chicken, yuzu mayo', prix: 14 },
        { nom: 'Edamame', desc: 'Fleur de sel', en: 'Sea salt', prix: 7, vege: true },
        { nom: 'Concombre au sésame', nomEn: 'Sesame cucumber', desc: 'Concombre tapé, huile pimentée', en: 'Smashed cucumber, chilli oil', prix: 8, vege: true, epice: true },
      ] },
    ],
  },
];

export const parId = (id) => RESTAURANTS.find((r) => r.id === id);
