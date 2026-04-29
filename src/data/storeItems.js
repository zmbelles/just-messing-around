export const CATEGORIES = [
  { id: 'consumables', label: 'Consumables'       },
  { id: 'drivetrain',  label: 'Drivetrain'         },
  { id: 'sprockets',   label: 'Sprockets',         subcategories: ['#35 Front', '#35 Rear', '#219 Front', '#219 Rear'] },
  { id: 'brakes',      label: 'Brakes'             },
  { id: 'chassis',     label: 'Chassis & Steering' },
  { id: 'tires',       label: 'Tires & Wheels'     },
  { id: 'body',        label: 'Body'               },
  { id: 'engine',      label: 'Engine'             },
  { id: 'electronics', label: 'Electronics'        },
  { id: 'facilities',  label: 'Facilities'         },
]

function makeSprockets(pitch, type, teeth) {
  const pitchLabel = pitch === 35 ? '#35' : '#219'
  const sub = `${pitchLabel} ${type}`
  return teeth.map(t => {
    const item = {
      id:          `sprocket-${pitch}-${type.toLowerCase()}-${t}`,
      category:    'sprockets',
      subcategory: sub,
      name:        `${pitchLabel} ${type} Sprocket — ${t}T`,
      desc:        `${pitchLabel} chain pitch, ${t}-tooth ${type.toLowerCase()} sprocket.`,
      price:       16.99,
      unit:        'each',
      partsKey:    `sprocket_${pitch}_${type.toLowerCase()}_${t}`,
      teeth:       t,
    }
    // #35 pitch only for Norway Club; #219 only for Route 66 and Ignite Challenge
    if (pitch === 35) {
      item.restrictedTo = 'norway'
      item.desc = `${item.desc} Club series only.`
    } else if (pitch === 219) {
      item.restrictedTo = ['route66', 'ignite-challenge']
      item.desc = `${item.desc} Route 66 and Ignite Challenge only.`
    }
    return item
  })
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

const SPROCKET_ITEMS = [
  ...makeSprockets(35,  'Front', range(12, 17)),
  ...makeSprockets(35,  'Rear',  range(53, 85)),
  ...makeSprockets(219, 'Front', range(11, 16)),
  ...makeSprockets(219, 'Rear',  range(66, 103)),
].map(item => {
  // Ignite Challenge: front sprocket is fixed and cannot be changed
  if (item.restrictedTo?.includes?.('ignite-challenge') && item.subcategory.includes('Front')) {
    item.restrictedTo = ['route66'] // Ignite can't access front sprockets
    item.desc = `${item.desc.replace(/Route 66 and Ignite Challenge only\.$/, 'Route 66 only. Ignite Challenge front sprocket is fixed.')} Route 66 only.`
  }
  return item
})

// inventoryKey: maps to gameState.consumables
// partsKey:     maps to gameState.parts
export const STORE_ITEMS = [
  // ── Consumables ──────────────────────────────────────────
  { id: 'oil',         category: 'consumables', name: 'Engine Oil',    desc: '4-stroke oil, 1 qt. Required each race.',                    price: 8,   unit: 'qt',     inventoryKey: 'oil'       },
  { id: 'fuel',        category: 'consumables', name: 'Race Fuel',     desc: 'Race fuel, 1 gallon. Need 3 per race.',             price: 12,  unit: 'gal',    inventoryKey: 'fuel'      },
  { id: 'chainLube',   category: 'consumables', name: 'Chain Lube',    desc: 'Keeps your drive chain happy. Required each race.',           price: 6,   unit: 'can',    inventoryKey: 'chainLube' },
  { id: 'triFlow',     category: 'consumables', name: 'Tri-Flow',      desc: 'Thin lubricant for bearings and pivots. Required each race.', price: 7,   unit: 'can',    inventoryKey: 'triFlow'   },
  { id: 'sparkPlug',   category: 'consumables', name: 'Spark Plug',    desc: 'NGK BR7ES. Swap every few races.',                           price: 4,   unit: 'each',   partsKey: 'sparkPlug'     },
  { id: 'airFilter',   category: 'consumables', name: 'Air Filter',    desc: 'Stock LO206 foam air filter.',                               price: 12,  unit: 'each',   partsKey: 'airFilter'     },
  { id: 'fuelFilter',  category: 'consumables', name: 'Fuel Filter',   desc: 'Inline fuel filter. Replace if fuel flow is sluggish.',      price: 6,   unit: 'each',   partsKey: 'fuelFilter'    },
  { id: 'brakeFluid',  category: 'consumables', name: 'Brake Fluid',      desc: 'DOT 4 brake fluid, 250ml.',                                      price: 8,   unit: 'bottle', partsKey: 'brakeFluid'       },
  { id: 'nutsAndBolts',  category: 'consumables', name: 'Spare Nuts & Bolts', desc: 'Assorted hardware kit. Used randomly each race. Without these, crashes and part failures cannot be fixed on-site — even if you have spare parts.', price: 5,  unit: 'pack', inventoryKey: 'nutsAndBolts'  },
  { id: 'bumperClips',   category: 'consumables', name: 'Bumper Clips',       desc: 'Plastic retaining clips for front and rear bumpers. A handful get broken each race.',                                                               price: 3,  unit: 'pack', inventoryKey: 'bumperClips'   },

  // ── Drivetrain ────────────────────────────────────────────
  { id: 'chain35',      category: 'drivetrain', name: '#35 Chain',        desc: '106-link standard #35 drive chain.',               price: 18, unit: 'each', partsKey: 'chain35'      },
  { id: 'chain219',     category: 'drivetrain', name: '#219 Chain',       desc: '106-link #219 pitch drive chain.',                  price: 20, unit: 'each', partsKey: 'chain219'     },
  { id: 'clutch',       category: 'drivetrain', name: 'Clutch Assembly',  desc: 'Complete LO206 wet clutch assembly.',               price: 95, unit: 'each', partsKey: 'clutch'       },
  { id: 'clutchDisc',   category: 'drivetrain', name: 'Clutch Disc',      desc: 'Replacement friction disc for wet clutch.',         price: 32, unit: 'each', partsKey: 'clutchDisc'   },

  // ── Sprockets (generated) ────────────────────────────────
  ...SPROCKET_ITEMS,

  // ── Brakes ────────────────────────────────────────────────
  { id: 'brakePads',    category: 'brakes', name: 'Brake Pads',    desc: 'Rear disc brake pad set.',                                price: 38, unit: 'pair', partsKey: 'brakePads'    },
  { id: 'brakeRotor',   category: 'brakes', name: 'Brake Rotor',   desc: 'Vented rear rotor. Replace when worn below 3mm.',         price: 58, unit: 'each', partsKey: 'brakeRotor'   },
  { id: 'brakeCaliper', category: 'brakes', name: 'Brake Caliper', desc: 'Single-piston hydraulic rear caliper.',                   price: 78, unit: 'each', partsKey: 'brakeCaliper' },
  { id: 'brakeLine',    category: 'brakes', name: 'Brake Line',    desc: 'Stainless braided hydraulic brake line.',                 price: 22, unit: 'each', partsKey: 'brakeLine'    },

  // ── Chassis & Steering ────────────────────────────────────
  { id: 'axle',            category: 'chassis', name: 'Axle',             desc: 'Standard 50mm CNC axle.',                          price: 125, unit: 'each', partsKey: 'axle'           },
  { id: 'axleBearings',    category: 'chassis', name: 'Axle Bearing Kit', desc: 'Complete rear axle bearing and hanger set.',        price: 48,  unit: 'kit',  partsKey: 'axleBearings'   },
  { id: 'spindle',         category: 'chassis', name: 'Front Spindle',    desc: 'Replacement front spindle, sold individually.',     price: 68,  unit: 'each', partsKey: 'spindle'        },
  { id: 'tieRod',          category: 'chassis', name: 'Tie Rod',          desc: 'Adjustable front tie rod assembly.',                price: 28,  unit: 'each', partsKey: 'tieRod'         },
  { id: 'kingPin',         category: 'chassis', name: 'King Pin Kit',     desc: 'King pin, bushings, and hardware.',                 price: 38,  unit: 'kit',  partsKey: 'kingPin'        },
  { id: 'steeringColumn',  category: 'chassis', name: 'Steering Column',  desc: 'Complete column shaft with universal joint.',       price: 85,  unit: 'each', partsKey: 'steeringColumn' },
  { id: 'spindleArmLeft',  category: 'chassis', name: 'Spindle Arm — Left',  desc: 'Front left steering arm / spindle carrier.',    price: 42,  unit: 'each', partsKey: 'spindleArmLeft'  },
  { id: 'spindleArmRight', category: 'chassis', name: 'Spindle Arm — Right', desc: 'Front right steering arm / spindle carrier.',   price: 42,  unit: 'each', partsKey: 'spindleArmRight' },

  // ── Tires & Wheels ────────────────────────────────────────
  { id: 'tiresHoosierSlick', category: 'tires', name: 'Hoosier Slick',   desc: 'Hoosier karting slick, set of 4. IGNITE CHALLENGE ONLY.',                                               price: 200, unit: 'set', partsKey: 'tiresHoosierSlick', durability: 100, power: 100, restrictedTo: 'ignite-challenge' },
  { id: 'tiresHoosierRain',  category: 'tires', name: 'Hoosier Rain',    desc: 'Hoosier grooved wet tire, set of 4. IGNITE CHALLENGE ONLY.',                                                  price: 230, unit: 'set', partsKey: 'tiresHoosierRain',  durability: 100, power: 100, restrictedTo: 'ignite-challenge' },
  { id: 'tiresMGYellow',     category: 'tires', name: 'MG Yellow Slick', desc: 'MG Yellow slick, set of 4. Approved at all tracks.',                                                           price: 185, unit: 'set', partsKey: 'tiresMGYellow',     durability: 100, power: 100 },
  { id: 'tiresMGOrange',     category: 'tires', name: 'MG Orange Slick', desc: 'MG Orange slick, set of 4. Club series default. Approved at all tracks.',                                       price: 180, unit: 'set', partsKey: 'tiresMGOrange',     durability: 100, power: 100 },
  { id: 'tiresMGRed',        category: 'tires', name: 'MG Red Slick',    desc: 'MG Red slick, set of 4. APPROVED AT 61 KARTWAY ONLY — using elsewhere will result in disqualification.',      price: 195, unit: 'set', partsKey: 'tiresMGRed',        durability: 100, power: 100, restrictedTo: '61 Kartway' },
  { id: 'tiresRain',         category: 'tires', name: 'Rain Tires',      desc: 'Generic grooved wet-weather tire, set of 4. Approved at all tracks.',                                         price: 175, unit: 'set', partsKey: 'tiresRain',         durability: 100, power: 100 },
  { id: 'wheel',             category: 'tires', name: 'Wheel',           desc: '130mm magnesium wheel, sold individually.',                                                                    price: 48,  unit: 'each', partsKey: 'wheel' },

  // ── Body ──────────────────────────────────────────────────
  { id: 'frame',        category: 'body', name: 'Frame',            desc: 'Bare kart frame, no bodywork or engine.',                          price: 1750, unit: 'each', partsKey: 'frame'        },
  { id: 'rollerFrame',  category: 'body', name: 'Roller Frame',     desc: 'Complete roller — frame, bodywork, and running gear. No engine.',  price: 4000, unit: 'each', partsKey: 'rollerFrame'  },
  { id: 'sidePodLeft',  category: 'body', name: 'Side Pod — Left',  desc: 'Left side pod, ABS plastic.',                                     price: 52,   unit: 'each', partsKey: 'sidePodLeft'  },
  { id: 'sidePodRight', category: 'body', name: 'Side Pod — Right', desc: 'Right side pod, ABS plastic.',                                    price: 52,   unit: 'each', partsKey: 'sidePodRight' },
  { id: 'fairing',      category: 'body', name: 'Fairing',          desc: 'Nassau panel / front fairing.',                                   price: 58,   unit: 'each', partsKey: 'fairing'      },
  { id: 'frontBumper',  category: 'body', name: 'Front Bumper',     desc: 'Front nerf bar / bumper assembly.',                               price: 45,   unit: 'each', partsKey: 'frontBumper'  },
  { id: 'rearBumper',   category: 'body', name: 'Rear Bumper',      desc: 'Rear bumper bar assembly.',                                       price: 45,   unit: 'each', partsKey: 'rearBumper'   },

  // ── Engine ────────────────────────────────────────────────
  { id: 'completeEngine',    category: 'engine', name: 'Complete Engine',            desc: 'Brand new sealed Briggs & Stratton LO206 engine.',                                     price: 450,  unit: 'each', partsKey: 'completeEngine',   durability: 100, power: 100 },
  { id: 'lawsonPrepEngine',  category: 'engine', name: 'Lawson Race-Prepped LO206', desc: 'Dyno-tuned and blueprinted LO206 by Lawson Speed Shop. Built to the edge of the rules.', price: 1300, unit: 'each', partsKey: 'lawsonPrepEngine', durability: 85,  power: 100 },
  { id: 'dmitriEngine',      category: 'engine', name: 'Dmitri Race Engine',         desc: 'Fully-built Dmitri engine. High power output. Rare. Unlocked through rare events.',                     price: 2500, unit: 'each', partsKey: 'dmitriEngine',      durability: 100, power: 115 },
  { id: 'clutchEngine',   category: 'engine', name: 'Clutch Assembly',   desc: 'Complete LO206 wet clutch assembly.',                        price: 95,  unit: 'each', partsKey: 'clutch'         },
  { id: 'carburetor',     category: 'engine', name: 'Carburetor',        desc: 'Stock LO206 Chikuni carb. Sealed — no mods.',                price: 98,  unit: 'each', partsKey: 'carburetor'     },
  { id: 'throttleCable',  category: 'engine', name: 'Throttle Cable',    desc: 'Replacement throttle cable and housing.',                    price: 14,  unit: 'each', partsKey: 'throttleCable'  },
  { id: 'killSwitch',     category: 'engine', name: 'Kill Switch',       desc: 'Tether-style engine kill switch.',                           price: 12,  unit: 'each', partsKey: 'killSwitch'     },
  { id: 'recoilStarter',  category: 'engine', name: 'Recoil Starter',    desc: 'Complete recoil starter assembly.',                          price: 48,  unit: 'each', partsKey: 'recoilStarter'  },
  { id: 'catchCan',       category: 'engine', name: 'Catch Can',         desc: 'Engine breather catch can. Required at most tracks to keep oil off the racing surface.', price: 18, unit: 'each', partsKey: 'catchCan' },

  // ── Electronics ───────────────────────────────────────────
  { id: 'transponder', category: 'electronics', name: 'Transponder',          desc: 'AMB/MyLaps transponder. Required at all tracks — officials use it to record your times and position.', price: 150, unit: 'each', partsKey: 'transponder' },
  { id: 'mychron',     category: 'electronics', name: 'MyChron 6 Lap Timer', desc: 'AiM MyChron 6 data logger and lap timer. Required to read your times and dial in setup.',              price: 600, unit: 'each', partsKey: 'mychron'      },

  // ── Facilities ────────────────────────────────────────────
  { id: 'garage', category: 'facilities', name: 'Garage Space', desc: 'Dedicated garage bay at the track. Required to store spare karts and chassis between races. Cannot be rented until Season 2.', price: 5000, unit: 'season', partsKey: null, inventoryKey: null, lockedUntilSeason: 2 },
]
