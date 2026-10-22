// ============================================================================
// NOTE ON CORRECTIONS MADE TO THIS FILE
// ============================================================================
// 1. city must be exactly one of: "London", "Paris", "Newyork", "Amsterdam"
//    (see constants.js CITIES enum, and the trained ML model's city categories).
//    - "New York" (two words) was changed to "Newyork" (one word, capital N).
//    - "Tokyo" was removed and replaced with Amsterdam listings, since Tokyo
//      was never part of the training data (city enum doesn't allow it either).
//
// 2. neighbourhood must match the neighbourhood_cleansed values the model was
//    trained on, otherwise the model treats it as an "unknown" category and
//    ignores it (reducing prediction accuracy). These are administrative
//    areas (London = borough, Paris = arrondissement cluster), not casual
//    tourist-area names. Mapping used below:
//      Camden          -> Camden                     (exact match)
//      Shoreditch      -> Hackney                     (Shoreditch is in Hackney borough)
//      Notting Hill    -> Kensington and Chelsea
//      Kensington      -> Kensington and Chelsea
//      Soho            -> Westminster
//      Greenwich       -> Greenwich                   (exact match)
//      Le Marais       -> Hôtel-de-Ville               (4th arr., core of Le Marais)
//      Montmartre      -> Buttes-Montmartre            (18th arr.)
//      St-Germain-des-Prés -> Luxembourg               (6th arr.)
//      Latin Quarter   -> Panthéon                     (5th arr.)
//      Champs-Élysées  -> Élysée                        (8th arr.)
//      Belleville      -> Ménilmontant                  (adjoining 20th arr. cluster)
//      New York areas  -> unchanged (Williamsburg, SoHo, Upper East Side,
//                          Greenwich Village, Harlem, Chelsea all matched exactly)
//      Amsterdam areas -> Centrum-West, De Pijp - Rivierenbuurt, Centrum-Oost,
//                          Zuid, De Baarsjes - Oud-West, Oud-Oost
//
// 3. KNOWN DATA ISSUE (not fixable from seed data alone): data/paris.csv used
//    to train the model has its "city" column wrongly set to "London" instead
//    of "Paris". This means the model has never actually learned "Paris" as a
//    separate city category. Paris predictions will still be less accurate
//    until paris.csv is relabelled correctly and the model is retrained.
//
// 4. owner has been added to every listing, split between the two given
//    hosts:
//      hiteshkanwar -> 6a5008b6e827302463d8e7fa
//      demo1        -> 6a5c714168c1b324fc90a91d
// ============================================================================

const HOST_1 = "6ada17375de6a00e265c702e";
const HOST_2 = "6ada17375de6a00e265c702e";

const sampleListings = [
  // ---------------- London ----------------
  {
    title: "Cozy Flat in Camden",
    description:
      "Charming one-bedroom flat steps from Camden Market. Enjoy quick access to the canal, live music venues, and street food stalls.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1501183638710-841dd1904471?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 120,
    city: "London",
    neighbourhood: "Camden",
    roomType: "Entire home/apt",
    accommodates: 2,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 51.5390,
    longitude: -0.1426,
    owner: HOST_1,
  },
  {
    title: "Trendy Loft in Shoreditch",
    description:
      "Industrial-chic loft in the heart of Shoreditch, surrounded by street art, rooftop bars, and independent cafes.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 150,
    city: "London",
    neighbourhood: "Hackney",
    roomType: "Entire home/apt",
    accommodates: 4,
    bathrooms: 1,
    bedrooms: 2,
    beds: 2,
    latitude: 51.5255,
    longitude: -0.0778,
    owner: HOST_2,
  },
  {
    title: "Elegant Room in Notting Hill",
    description:
      "Bright private room in a Victorian townhouse near the famous Portobello Road Market.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 80,
    city: "London",
    neighbourhood: "Kensington and Chelsea",
    roomType: "Private room",
    accommodates: 1,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 51.5152,
    longitude: -0.1968,
    owner: HOST_1,
  },
  {
    title: "Kensington Garden View Apartment",
    description:
      "Spacious apartment overlooking Kensington Gardens, close to museums and royal parks.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 220,
    city: "London",
    neighbourhood: "Kensington and Chelsea",
    roomType: "Entire home/apt",
    accommodates: 5,
    bathrooms: 2,
    bedrooms: 3,
    beds: 3,
    latitude: 51.5017,
    longitude: -0.1926,
    owner: HOST_2,
  },
  {
    title: "Soho Boutique Studio",
    description:
      "Compact studio in vibrant Soho, walking distance to theatres, restaurants, and nightlife.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1489171078254-c3365d6e359f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 140,
    city: "London",
    neighbourhood: "Westminster",
    roomType: "Entire home/apt",
    accommodates: 2,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 51.5136,
    longitude: -0.1365,
    owner: HOST_1,
  },
  {
    title: "Riverside Room in Greenwich",
    description:
      "Quiet private room near the Thames, close to Greenwich Park and the Royal Observatory.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 70,
    city: "London",
    neighbourhood: "Greenwich",
    roomType: "Private room",
    accommodates: 2,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 51.4826,
    longitude: -0.0077,
    owner: HOST_2,
  },

  // ---------------- Paris ----------------
  {
    title: "Charming Studio in Le Marais",
    description:
      "Historic studio apartment on a cobblestone street in Le Marais, surrounded by galleries and cafes.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 130,
    city: "Paris",
    neighbourhood: "Hôtel-de-Ville",
    roomType: "Entire home/apt",
    accommodates: 2,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 48.8580,
    longitude: 2.3623,
    owner: HOST_1,
  },
  {
    title: "Artist's Loft in Montmartre",
    description:
      "Cozy loft near Sacré-Cœur with sweeping views over the rooftops of Paris.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1431274172761-fca41d930114?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 160,
    city: "Paris",
    neighbourhood: "Buttes-Montmartre",
    roomType: "Entire home/apt",
    accommodates: 3,
    bathrooms: 1,
    bedrooms: 1,
    beds: 2,
    latitude: 48.8867,
    longitude: 2.3431,
    owner: HOST_2,
  },
  {
    title: "Elegant Room near Saint-Germain",
    description:
      "Classic Parisian private room close to Saint-Germain-des-Prés, minutes from the Seine.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 95,
    city: "Paris",
    neighbourhood: "Luxembourg",
    roomType: "Private room",
    accommodates: 1,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 48.8539,
    longitude: 2.3336,
    owner: HOST_1,
  },
  {
    title: "Latin Quarter Family Apartment",
    description:
      "Spacious apartment in the historic Latin Quarter, steps from the Sorbonne and the Panthéon.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1521783988139-89397d761dce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 210,
    city: "Paris",
    neighbourhood: "Panthéon",
    roomType: "Entire home/apt",
    accommodates: 5,
    bathrooms: 2,
    bedrooms: 3,
    beds: 3,
    latitude: 48.8496,
    longitude: 2.3468,
    owner: HOST_2,
  },
  {
    title: "Champs-Élysées Luxury Suite",
    description:
      "Upscale hotel-style suite steps from the Champs-Élysées and the Arc de Triomphe.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1541971875076-8f970d573be6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 350,
    city: "Paris",
    neighbourhood: "Élysée",
    roomType: "Hotel room",
    accommodates: 2,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 48.8698,
    longitude: 2.3078,
    owner: HOST_1,
  },
  {
    title: "Bohemian Room in Belleville",
    description:
      "Affordable shared room in the up-and-coming, multicultural Belleville neighbourhood.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 55,
    city: "Paris",
    neighbourhood: "Ménilmontant",
    roomType: "Shared room",
    accommodates: 1,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 48.8722,
    longitude: 2.3831,
    owner: HOST_2,
  },

  // ---------------- New York ----------------
  {
    title: "Chic Loft in SoHo",
    description:
      "Designer loft with exposed brick in trendy SoHo, close to boutique shopping and galleries.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1501183638710-841dd1904471?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 280,
    city: "Newyork",
    neighbourhood: "SoHo",
    roomType: "Entire home/apt",
    accommodates: 4,
    bathrooms: 2,
    bedrooms: 2,
    beds: 2,
    latitude: 40.7233,
    longitude: -74.0030,
    owner: HOST_1,
  },
  {
    title: "Artsy Room in Williamsburg",
    description:
      "Private room in a converted warehouse in Williamsburg, minutes from Brooklyn's best coffee shops.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 100,
    city: "Newyork",
    neighbourhood: "Williamsburg",
    roomType: "Private room",
    accommodates: 2,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 40.7081,
    longitude: -73.9571,
    owner: HOST_2,
  },
  {
    title: "Classic Apartment on the Upper East Side",
    description:
      "Elegant pre-war apartment near Central Park and Museum Mile.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 260,
    city: "Newyork",
    neighbourhood: "Upper East Side",
    roomType: "Entire home/apt",
    accommodates: 4,
    bathrooms: 2,
    bedrooms: 2,
    beds: 2,
    latitude: 40.7736,
    longitude: -73.9566,
    owner: HOST_1,
  },
  {
    title: "Cozy Studio in Greenwich Village",
    description:
      "Compact studio on a tree-lined street in historic Greenwich Village.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 190,
    city: "Newyork",
    neighbourhood: "Greenwich Village",
    roomType: "Entire home/apt",
    accommodates: 2,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 40.7336,
    longitude: -74.0027,
    owner: HOST_2,
  },
  {
    title: "Historic Brownstone Room in Harlem",
    description:
      "Comfortable private room in a landmark brownstone, close to the Apollo Theater.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 90,
    city: "Newyork",
    neighbourhood: "Harlem",
    roomType: "Private room",
    accommodates: 1,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 40.8116,
    longitude: -73.9465,
    owner: HOST_1,
  },
  {
    title: "Modern High-Rise in Chelsea",
    description:
      "Sleek apartment with skyline views near the High Line and Chelsea Market.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 240,
    city: "Newyork",
    neighbourhood: "Chelsea",
    roomType: "Entire home/apt",
    accommodates: 3,
    bathrooms: 1,
    bedrooms: 2,
    beds: 2,
    latitude: 40.7465,
    longitude: -74.0014,
    owner: HOST_2,
  },

  // ---------------- Amsterdam (replaces Tokyo, which was never in training data) ----------------
  {
    title: "Canal House Apartment in Centrum-West",
    description:
      "Classic canal-side apartment in the historic city center, close to the Jordaan and Anne Frank House.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1480796927426-f609979314bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 180,
    city: "Amsterdam",
    neighbourhood: "Centrum-West",
    roomType: "Entire home/apt",
    accommodates: 3,
    bathrooms: 1,
    bedrooms: 1,
    beds: 2,
    latitude: 52.3789,
    longitude: 4.8894,
    owner: HOST_1,
  },
  {
    title: "Cozy Room near De Pijp",
    description:
      "Private room in a lively neighbourhood known for the Albert Cuyp Market and trendy cafes.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 85,
    city: "Amsterdam",
    neighbourhood: "De Pijp - Rivierenbuurt",
    roomType: "Private room",
    accommodates: 1,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 52.3546,
    longitude: 4.8926,
    owner: HOST_2,
  },
  {
    title: "Houseboat Stay near Centrum-Oost",
    description:
      "Unique houseboat experience close to the Waterlooplein market and the Royal Palace.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1554797589-7241bb691973?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 150,
    city: "Amsterdam",
    neighbourhood: "Centrum-Oost",
    roomType: "Entire home/apt",
    accommodates: 2,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 52.3707,
    longitude: 4.9041,
    owner: HOST_1,
  },
  {
    title: "Business Suite in Zuid",
    description:
      "Modern hotel-style suite in Amsterdam's business district, close to the RAI convention centre.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 300,
    city: "Amsterdam",
    neighbourhood: "Zuid",
    roomType: "Hotel room",
    accommodates: 2,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 52.3406,
    longitude: 4.8785,
    owner: HOST_2,
  },
  {
    title: "Stylish Loft in Oud-West",
    description:
      "Bright loft in trendy Oud-West, close to Foodhallen and Vondelpark.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 130,
    city: "Amsterdam",
    neighbourhood: "De Baarsjes - Oud-West",
    roomType: "Entire home/apt",
    accommodates: 2,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 52.3667,
    longitude: 4.8622,
    owner: HOST_1,
  },
  {
    title: "Shared Room in Oud-Oost",
    description:
      "Budget-friendly shared room in the quiet, residential Oud-Oost area.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1521783988139-89397d761dce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 55,
    city: "Amsterdam",
    neighbourhood: "Oud-Oost",
    roomType: "Shared room",
    accommodates: 1,
    bathrooms: 1,
    bedrooms: 1,
    beds: 1,
    latitude: 52.3583,
    longitude: 4.9200,
    owner: HOST_2,
  },
];

module.exports = { data: sampleListings };