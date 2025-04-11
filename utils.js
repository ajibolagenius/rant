// Utility: Check color brightness for contrast logic
export const isLightColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
};

// ✅ Persistent alias generation based on rant ID
const pseudonyms = [
    'Anon Falcon', 'Mystery Cat', 'Silent Echo', 'Shadow Leaf',
    'Whisper Wolf', 'Crimson Bloom', 'Hidden Panda', 'Night Raven',
    'Quiet Fox', 'Drifting Cloud', 'Cosmic Turtle', 'Velvet Ghost',
    'Azure Dragon', 'Emerald Tiger', 'Ruby Phoenix', 'Sapphire Owl',
    'Jade Serpent', 'Golden Monkey', 'Silver Wolf', 'Bronze Eagle',
    'Obsidian Raven', 'Amber Lion', 'Crystal Deer', 'Onyx Panther',
    'Emerald Fox', 'Golden Eagle', 'Scarlet Hawk', 'Ivory Dolphin',
    'Cobalt Lynx', 'Platinum Bear', 'Amber Phoenix', 'Shadow Lynx',
    'Frost Falcon', 'Blazing Comet', 'Twilight Stag', 'Eclipse Fox',
    'Nebula Swan', 'Aurora Wolf', 'Stellar Owl', 'Lunar Tiger',
    'Solar Panther', 'Meteor Dragon', 'Comet Eagle', 'Galaxy Serpent',
    'Nova Lion', 'Quasar Turtle', 'Radiant Deer', 'Celestial Raven',
    'Dusk Leopard', 'Dawn Falcon', 'Phantom Shark', 'Glacial Wolf',
    'Thunder Elk', 'Oblivion Crow', 'Shimmering Otter', 'Frozen Lynx',
    'Crimson Sparrow', 'Ivory Serpent', 'Shadow Falcon', 'Blazing Lynx',
    'Ethereal Stag', 'Mystic Dolphin', 'Aurora Panther', 'Solar Swan',
    'Twilight Bear', 'Lunar Owl', 'Nebula Tiger', 'Radiant Fox',
    'Celestial Stag', 'Dusk Phoenix', 'Dawn Leopard', 'Frost Owl',
    'Blazing Wolf', 'Velvet Panther', 'Golden Stag', 'Silver Dolphin',
    'Crystal Swan', 'Amber Bear', 'Ruby Lynx', 'Emerald Crow',
    'Azure Sparrow', 'Obsidian Tiger', 'Ivory Panther', 'Cobalt Falcon',
    'Platinum Stag', 'Scarlet Otter', 'Eclipse Dragon', 'Meteor Lynx',
    'Galaxy Owl', 'Nova Swan', 'Quasar Bear', 'Aurora Serpent',
    'Stellar Fox', 'Lunar Deer', 'Solar Crow', 'Comet Tiger',
    'Radiant Panther', 'Celestial Otter', 'Dusk Swan', 'Dawn Wolf'
];

export const generateAlias = (rantId) => {
    const key = `alias_${rantId}`;
    const saved = localStorage.getItem(key);
    if (saved) return saved;

    const alias = pseudonyms[Math.floor(Math.random() * pseudonyms.length)];
    localStorage.setItem(key, alias);
    return alias;
};
