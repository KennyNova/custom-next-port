// Bulk photo upload script for existing photos
// This is a helper script to upload multiple photos with parsed metadata

const photos = [
  'abstract_film-ar-08022022.webp',
  'abstract_people-alex-04082018.webp',
  'cars_film-nightz-08022022.webp',
  'cars-350z_in_smoke-05072022.webp',
  'cars-borja-05072022.webp',
  'cars-chase-08022022.webp',
  'cars-knewz-05072022.webp',
  'cars-lean-08022022.webp',
  'cars-miat-08022022.webp',
  'cars-porsha-08022022.webp',
  'cars-purp-08022022.webp',
  'cars-ray-08022022.webp',
  'cars-silva-08022022.webp',
  'cars-stang-05072022.webp',
  'cars-winner!-05072022.webp',
  'cars-zzz-08222022.webp',
  'city_film-lamp_side-08022022.webp',
  'city_newyork_film-scrapes-08022022.webp',
  'city_newyork-w_37st-08022022.webp',
  'city-alleyway-10112019.webp',
  'city-bar-08022022.webp',
  'city-lim-12132019.webp',
  'film_abstract-lamp-01152021.webp',
  'film_city-min-01152021.webp',
  'film_nature-its_a_plane!-08222022.webp',
  'film_nature-stop-08022022.webp',
  'landscape-tiger_boat-06212018.webp',
  'nature_film-golden-08022022.webp',
  'nature_film-green-01192021.webp',
  'nature_film-keh-08022022.webp',
  'nature_film-path-08022022.webp',
  'nature-blossom-03022019.webp',
  'nature-clif-02202022.webp',
  'nature-daisy-10122019.webp',
  'nature-flowers-08022022.webp',
  'nature-seats-04232022.webp',
  'nature-violet_grove-02112021.webp',
  'nature-wheat-11172019.webp',
  'people-distinguished_lucky-08022022.webp',
  'people-rainbow-01152021.webp'
];

function parseFilename(filename) {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const parts = nameWithoutExt.split('-');
  
  if (parts.length < 2) {
    return {
      tags: [],
      title: nameWithoutExt.replace(/[_-]/g, ' '),
      dateString: '',
    };
  }

  const dateString = parts[parts.length - 1];
  let parsedDate;
  
  if (dateString.length === 8 && /^\d{8}$/.test(dateString)) {
    const month = parseInt(dateString.substring(0, 2), 10);
    const day = parseInt(dateString.substring(2, 4), 10);
    const year = parseInt(dateString.substring(4, 8), 10);
    
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900) {
      parsedDate = new Date(year, month - 1, day);
    }
  }

  const titleParts = parts.slice(1, -1);
  const title = titleParts.join(' ').replace(/_/g, ' ');
  const tagsPart = parts[0];
  const tags = tagsPart.split('_').map(tag => tag.trim()).filter(Boolean);

  return { tags, title, dateString, parsedDate };
}

// Generate parsed data for all photos
const parsedPhotos = photos.map(filename => {
  const parsed = parseFilename(filename);
  return {
    filename,
    ...parsed,
    dateFormatted: parsed.parsedDate ? parsed.parsedDate.toDateString() : 'Invalid Date'
  };
});

// Log the results
console.log('=== PARSED PHOTO METADATA ===\n');
parsedPhotos.forEach(photo => {
  console.log(`📸 ${photo.filename}`);
  console.log(`   🏷️  Tags: ${photo.tags.join(', ')}`);
  console.log(`   📝 Title: ${photo.title}`);
  console.log(`   📅 Date: ${photo.dateFormatted}`);
  console.log('');
});

console.log('\n=== SUMMARY ===');
console.log(`Total photos: ${photos.length}`);
console.log(`Valid dates: ${parsedPhotos.filter(p => p.parsedDate).length}`);

const allTags = [...new Set(parsedPhotos.flatMap(p => p.tags))].sort();
console.log(`Unique tags: ${allTags.join(', ')}`);

const tagCounts = {};
parsedPhotos.forEach(p => {
  p.tags.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
});

console.log('\n=== TAG DISTRIBUTION ===');
Object.entries(tagCounts)
  .sort(([,a], [,b]) => b - a)
  .forEach(([tag, count]) => {
    console.log(`${tag}: ${count} photos`);
  });
