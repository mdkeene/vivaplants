const PLANT_LIBRARY = [
  {
    label: "Aloe Vera",
    value: "aloe_vera",
    scientific: "Aloe vera",
    care: {
      light: "Bright direct to indirect light",
      watering: "Let soil fully dry between watering",
      humidity: "Low",
      notes: "Drought tolerant, sensitive to overwatering"
    }
  },
  {
    label: "Alocasia (Elephant Ear)",
    value: "alocasia_spp",
    scientific: "Alocasia spp.",
    care: {
      light: "Bright indirect light",
      watering: "Keep soil slightly moist",
      humidity: "High",
      notes: "Sensitive to dry air and drafts"
    }
  },
  {
    label: "Anthurium",
    value: "anthurium_andraeanum",
    scientific: "Anthurium andraeanum",
    care: {
      light: "Bright indirect light",
      watering: "Water when top soil is dry",
      humidity: "High",
      notes: "Needs warmth and humidity to bloom"
    }
  },
  {
    label: "Basil",
    value: "ocimum_basilicum",
    scientific: "Ocimum basilicum",
    care: {
      light: "Bright direct light (6+ hours)",
      watering: "Keep soil consistently moist",
      humidity: "Medium",
      notes: "Pinch off flowers to encourage leaf growth"
    }
  },
  {
    label: "Bird of Paradise",
    value: "strelitzia_reginae",
    scientific: "Strelitzia reginae",
    care: {
      light: "Bright direct light",
      watering: "Water when top soil dries",
      humidity: "Medium",
      notes: "Needs strong light to thrive indoors"
    }
  },
  {
    label: "Calathea (Prayer Plant)",
    value: "goeppertia_spp",
    scientific: "Goeppertia spp.",
    care: {
      light: "Low to medium indirect light",
      watering: "Keep soil consistently moist",
      humidity: "High",
      notes: "Very sensitive to dry air"
    }
  },
  {
    label: "Camellia",
    value: "camellia_japonica",
    scientific: "Camellia japonica",
    care: {
      light: "Bright indirect or filtered light",
      watering: "Keep soil moist but well-drained",
      humidity: "Medium to high",
      notes: "Needs cool temperatures to set buds"
    }
  },
  {
    label: "Chinese Evergreen",
    value: "aglaonema_spp",
    scientific: "Aglaonema spp.",
    care: {
      light: "Low to medium light",
      watering: "Water when top soil dries",
      humidity: "Medium",
      notes: "Very tolerant, good for low light"
    }
  },
  {
    label: "Chinese Money Plant (UFO Plant)",
    value: "pilea_peperomioides",
    scientific: "Pilea peperomioides",
    care: {
      light: "Bright indirect light",
      watering: "Water when soil is mostly dry",
      humidity: "Medium",
      notes: "Rotate plant for even growth"
    }
  },
  {
    label: "Curly Jade",
    value: "crassula_ovata_undulata",
    scientific: "Crassula ovata 'Undulata'",
    care: {
      light: "Bright direct light",
      watering: "Allow soil to dry completely",
      humidity: "Low",
      notes: "Succulent with rippled leaf margins"
    }
  },
  {
    label: "Daisy",
    value: "argyranthemum_frutescens",
    scientific: "Argyranthemum frutescens",
    care: {
      light: "Full sun to bright direct light",
      watering: "Water when top soil feels dry",
      humidity: "Medium",
      notes: "Deadhead spent blooms to encourage more flowers"
    }
  },
  {
    label: "Dracaena (Corn Plant)",
    value: "dracaena_fragrans",
    scientific: "Dracaena fragrans",
    care: {
      light: "Low to bright indirect light",
      watering: "Allow soil to dry between watering",
      humidity: "Low to medium",
      notes: "Sensitive to overwatering"
    }
  },
  {
    label: "Euonymus",
    value: "euonymus_japonicus",
    scientific: "Euonymus japonicus",
    care: {
      light: "Bright indirect to full sun",
      watering: "Water when top inch of soil is dry",
      humidity: "Medium",
      notes: "Hardy evergreen, can be prone to scale insects"
    }
  },
  {
    label: "Euphorbia 'Blackbird'",
    value: "euphorbia_blackbird",
    scientific: "Euphorbia 'Blackbird'",
    care: {
      light: "Full sun to bright light",
      watering: "Water sparingly, drought tolerant",
      humidity: "Low",
      notes: "Sap can be an irritant; avoid overwatering"
    }
  },
  {
    label: "Fiddle Leaf Fig",
    value: "ficus_lyrata",
    scientific: "Ficus lyrata",
    care: {
      light: "Bright indirect light",
      watering: "Water when top soil dries",
      humidity: "Medium",
      notes: "Prefers stable conditions"
    }
  },
  {
    label: "Hoya (Wax Plant)",
    value: "hoya_carnosa",
    scientific: "Hoya carnosa",
    care: {
      light: "Bright indirect light",
      watering: "Let soil dry between watering",
      humidity: "Medium",
      notes: "Prefers to stay slightly root-bound"
    }
  },
  {
    label: "Imperial Red Philodendron",
    value: "philodendron_imperial_red",
    scientific: "Philodendron 'Imperial Red'",
    care: {
      light: "Medium to bright indirect light",
      watering: "Water when top 50% of soil is dry",
      humidity: "Medium to high",
      notes: "Self-heading philodendron; doesn't climb"
    }
  },
  {
    label: "Jade Plant",
    value: "crassula_ovata",
    scientific: "Crassula ovata",
    care: {
      light: "Bright direct light",
      watering: "Let soil fully dry",
      humidity: "Low",
      notes: "Succulent, avoid overwatering"
    }
  },
  {
    label: "Lavender",
    value: "lavandula_spp",
    scientific: "Lavandula",
    care: {
      light: "Full sun / Bright direct light",
      watering: "Allow soil to dry completely",
      humidity: "Low",
      notes: "Needs excellent drainage and airflow"
    }
  },
  {
    label: "Lemon-Lime Philodendron",
    value: "philodendron_hederaceum_lemon_lime",
    scientific: "Philodendron hederaceum 'Lemon Lime'",
    care: {
      light: "Medium to bright indirect light",
      watering: "Water when top soil dries",
      humidity: "Medium",
      notes: "Neon foliage will fade in low light"
    }
  },
  {
    label: "Lipstick Plant",
    value: "aeschynanthus_radicans",
    scientific: "Aeschynanthus radicans",
    care: {
      light: "Bright indirect light",
      watering: "Keep moderately moist but not soggy",
      humidity: "High",
      notes: "Requires high light to produce flowers"
    }
  },
  {
    label: "Mint",
    value: "mentha_spp",
    scientific: "Mentha",
    care: {
      light: "Bright indirect to partial sun",
      watering: "Keep soil consistently moist",
      humidity: "Medium",
      notes: "Invasive grower; keep in its own pot"
    }
  },
  {
    label: "Monstera Deliciosa",
    value: "monstera_deliciosa",
    scientific: "Monstera deliciosa",
    care: {
      light: "Bright indirect light",
      watering: "Water when top 2–3 cm dries",
      humidity: "Medium to high",
      notes: "Avoid harsh direct sun"
    }
  },
  {
    label: "Money Tree",
    value: "pachira_aquatica",
    scientific: "Pachira aquatica",
    care: {
      light: "Bright indirect light",
      watering: "Water when top 50% of soil is dry",
      humidity: "High",
      notes: "Avoid moving frequently; likes humidity"
    }
  },
  {
    label: "Olive Tree",
    value: "olea_europaea",
    scientific: "Olea europaea",
    care: {
      light: "Full sun (6+ hours direct)",
      watering: "Water when top 2 inches dry",
      humidity: "Low",
      notes: "Needs very bright light to survive indoors"
    }
  },
  {
    label: "Peace Lily",
    value: "spathiphyllum_spp",
    scientific: "Spathiphyllum spp.",
    care: {
      light: "Low to medium light",
      watering: "Keep soil lightly moist",
      humidity: "High",
      notes: "Droops when thirsty"
    }
  },
  {
    label: "Peperomia",
    value: "peperomia_obtusifolia",
    scientific: "Peperomia obtusifolia",
    care: {
      light: "Medium indirect light",
      watering: "Let soil dry slightly",
      humidity: "Medium",
      notes: "Sensitive to overwatering"
    }
  },
  {
    label: "Philodendron (Heartleaf)",
    value: "philodendron_hederaceum",
    scientific: "Philodendron hederaceum",
    care: {
      light: "Low to bright indirect light",
      watering: "Water when top soil dries",
      humidity: "Medium",
      notes: "Very adaptable"
    }
  },
  {
    label: "Philodendron Squamiferum",
    value: "philodendron_squamiferum",
    scientific: "Philodendron squamiferum",
    care: {
      light: "Bright indirect light",
      watering: "Water when top 25% of soil is dry",
      humidity: "High",
      notes: "Distinctive fuzzy/hairy red stems"
    }
  },
  {
    label: "Pothos (Miracle / Trunk / Golden)",
    value: "epipremnum_aureum",
    scientific: "Epipremnum aureum",
    care: {
      light: "Low to bright indirect light",
      watering: "Allow soil to dry between watering",
      humidity: "Low to medium",
      notes: "Extremely hardy and versatile"
    }
  },
  {
    label: "Prayer Plant",
    value: "maranta_leuconeura",
    scientific: "Maranta leuconeura",
    care: {
      light: "Medium indirect light",
      watering: "Keep soil moist with distilled water",
      humidity: "High",
      notes: "Leaves fold up at night"
    }
  },
  {
    label: "Rubber Plant",
    value: "ficus_elastica",
    scientific: "Ficus elastica",
    care: {
      light: "Bright indirect light",
      watering: "Water when top soil dries",
      humidity: "Medium",
      notes: "Avoid cold drafts"
    }
  },
  {
    label: "Satin Pothos",
    value: "scindapsus_pictus",
    scientific: "Scindapsus pictus",
    care: {
      light: "Medium to bright indirect light",
      watering: "Water when leaves start to curl slightly",
      humidity: "Medium",
      notes: "Actually a Scindapsus, not a Pothos"
    }
  },
  {
    label: "Snake Plant",
    value: "dracaena_trifasciata",
    scientific: "Dracaena trifasciata",
    care: {
      light: "Low to bright light",
      watering: "Water sparingly",
      humidity: "Low",
      notes: "Extremely hardy"
    }
  },
  {
    label: "Spider Plant",
    value: "chlorophytum_comosum",
    scientific: "Chlorophytum comosum",
    care: {
      light: "Bright indirect light",
      watering: "Water when soil dries slightly",
      humidity: "Medium",
      notes: "Produces baby plants"
    }
  },
  {
    label: "Zonal Geranium",
    value: "pelargonium_hortorum",
    scientific: "Pelargonium x hortorum",
    care: {
      light: "Full sun to bright light",
      watering: "Water when top inch is dry",
      humidity: "Low to medium",
      notes: "Provide good drainage and avoid wetting leaves"
    }
  },
  {
    label: "ZZ Plant",
    value: "zamioculcas_zamiifolia",
    scientific: "Zamioculcas zamiifolia",
    care: {
      light: "Low to bright indirect light",
      watering: "Let soil fully dry",
      humidity: "Low",
      notes: "Very drought tolerant"
    }
  },
  {
    label: "Other / Custom",
    value: "custom",
    scientific: "",
    care: null
  }
];

function getPlantProfile(type) {
  if (!type) return null;
  return PLANT_LIBRARY.find(p => p.value === type);
}

function findPlantTypeMatch(type) {
  if (!type) return null;
  const normalized = type.toLowerCase().trim();
  return PLANT_LIBRARY.find(p =>
    p.value === type ||
    p.label.toLowerCase() === normalized ||
    p.scientific.toLowerCase() === normalized
  );
}

function getDefaultPlants() {
  return [
    {
      id: "plant_1",
      name: "Monstera",
      type: "monstera_deliciosa",
      lastWatered: "2026-03-23",
      frequency: 7,
      location: "Living Room",
      image: "https://images.unsplash.com/photo-1545241047-6083a3684587"
    },
    {
      id: "plant_2",
      name: "Aloe Vera",
      type: "aloe_vera",
      lastWatered: "2026-03-28",
      frequency: 12,
      location: "Kitchen",
      image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6"
    }
  ];
}

function getLightInsight(plant, profile) {
  if (!plant.lightHistory || plant.lightHistory.length === 0 || !profile || !profile.care) return null;

  const values = plant.lightHistory.map(r => r.lux);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  // Very simple thresholds
  if (profile.care.light.includes("Bright") && avg < 500) {
    return "Low light for this plant";
  }

  if (profile.care.light.includes("Low") && avg > 1500) {
    return "Light may be too strong";
  }

  return null;
}

function getWateringInsight(plant) {
  if (!plant.wateringHistory || plant.wateringHistory.length < 3) return null;

  const avg = getAverageWateringInterval(plant);
  if (!avg) return null;

  const last = plant.wateringHistory.slice(-2);
  const prev = new Date(last[0]);
  const curr = new Date(last[1]);
  const lastInterval = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

  if (lastInterval > avg + 2) {
    return "Watering less frequently than usual";
  }

  if (lastInterval < avg - 2) {
    return "Watering more frequently than usual";
  }

  return null;
}

function getSuitabilityInsight(plant) {
  if (!plant.lightHistory || plant.lightHistory.length === 0) return null;

  const values = plant.lightHistory.map(r => r.lux);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  if (avg > 1200) return "Suitable for bright-light plants";
  if (avg > 500) return "Suitable for medium-light plants";
  return "Suitable for low-light plants";
}