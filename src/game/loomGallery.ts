// Loom Gallery - Collection system where winning games contribute thread segments
// to gradually form artwork pieces. Completing an artwork unlocks a visual theme.

export interface ArtworkSection {
  id: string;
  name: string;
  threadsRequired: number;
  completed: boolean;
}

export interface Artwork {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: ArtworkSection[];
  totalThreadsRequired: number;
  unlocksTheme: string; // theme ID that gets unlocked
  completed: boolean;
}

export interface LoomGalleryState {
  artworks: Record<string, ArtworkProgress>;
}

export interface ArtworkProgress {
  threadsContributed: number;
  sectionsCompleted: number;
  totalSections: number;
  completed: boolean;
  completedAt?: number;
}

// --- Artwork Definitions ---

function createSections(artworkId: string, count: number, threadsPerSection: number): ArtworkSection[] {
  const sections: ArtworkSection[] = [];
  for (let i = 1; i <= count; i++) {
    sections.push({
      id: `${artworkId}_section_${i}`,
      name: `Section ${i}`,
      threadsRequired: threadsPerSection,
      completed: false,
    });
  }
  return sections;
}

export const ALL_ARTWORKS: Artwork[] = [
  {
    id: 'volta_dawn',
    name: 'Volta Dawn',
    description: 'Sunrise over water',
    icon: '🌅',
    sections: createSections('volta_dawn', 5, 40),
    totalThreadsRequired: 200,
    unlocksTheme: 'dawn',
    completed: false,
  },
  {
    id: 'indigo_loom',
    name: 'Indigo Loom',
    description: 'Deep blue weaving',
    icon: '🧵',
    sections: createSections('indigo_loom', 6, 50),
    totalThreadsRequired: 300,
    unlocksTheme: 'indigo',
    completed: false,
  },
  {
    id: 'savannah_gold',
    name: 'Savannah Gold',
    description: 'Golden plains',
    icon: '🌾',
    sections: createSections('savannah_gold', 5, 50),
    totalThreadsRequired: 250,
    unlocksTheme: 'savannah',
    completed: false,
  },
  {
    id: 'forest_rain',
    name: 'Forest Rain',
    description: 'Green canopy with rain',
    icon: '🌿',
    sections: createSections('forest_rain', 7, Math.floor(400 / 7)),
    totalThreadsRequired: 400,
    unlocksTheme: 'forest',
    completed: false,
  },
  {
    id: 'moonlit_web',
    name: 'Moonlit Web',
    description: 'Spider web in moonlight',
    icon: '🕸️',
    sections: createSections('moonlit_web', 6, Math.floor(350 / 6)),
    totalThreadsRequired: 350,
    unlocksTheme: 'moonlit',
    completed: false,
  },
  {
    id: 'festival_colours',
    name: 'Festival Colours',
    description: 'Vibrant celebration',
    icon: '🎊',
    sections: createSections('festival_colours', 8, Math.floor(500 / 8)),
    totalThreadsRequired: 500,
    unlocksTheme: 'festival',
    completed: false,
  },
];

// --- Gallery Functions ---

export function createDefaultGallery(): LoomGalleryState {
  const artworks: Record<string, ArtworkProgress> = {};
  for (const artwork of ALL_ARTWORKS) {
    artworks[artwork.id] = {
      threadsContributed: 0,
      sectionsCompleted: 0,
      totalSections: artwork.sections.length,
      completed: false,
    };
  }
  return { artworks };
}

export function contributeThreads(
  gallery: LoomGalleryState,
  artworkId: string,
  threads: number
): { gallery: LoomGalleryState; sectionsJustCompleted: number; artworkJustCompleted: boolean } {
  const artwork = ALL_ARTWORKS.find((a) => a.id === artworkId);
  if (!artwork) {
    return { gallery, sectionsJustCompleted: 0, artworkJustCompleted: false };
  }

  const progress = gallery.artworks[artworkId];
  if (!progress || progress.completed) {
    return { gallery, sectionsJustCompleted: 0, artworkJustCompleted: false };
  }

  const previousThreads = progress.threadsContributed;
  const newThreads = Math.min(previousThreads + threads, artwork.totalThreadsRequired);

  // Calculate sections completed before and after
  const threadsPerSection = artwork.totalThreadsRequired / artwork.sections.length;
  const previousSections = Math.floor(previousThreads / threadsPerSection);
  const newSections = Math.floor(newThreads / threadsPerSection);

  // If we've reached total threads, all sections are complete
  const finalSections = newThreads >= artwork.totalThreadsRequired
    ? artwork.sections.length
    : newSections;

  const sectionsJustCompleted = finalSections - previousSections;
  const artworkJustCompleted = !progress.completed && newThreads >= artwork.totalThreadsRequired;

  const updatedProgress: ArtworkProgress = {
    threadsContributed: newThreads,
    sectionsCompleted: finalSections,
    totalSections: artwork.sections.length,
    completed: newThreads >= artwork.totalThreadsRequired,
    completedAt: artworkJustCompleted ? Date.now() : progress.completedAt,
  };

  const updatedGallery: LoomGalleryState = {
    artworks: {
      ...gallery.artworks,
      [artworkId]: updatedProgress,
    },
  };

  return {
    gallery: updatedGallery,
    sectionsJustCompleted,
    artworkJustCompleted,
  };
}

export function getArtworkProgress(gallery: LoomGalleryState, artworkId: string): ArtworkProgress {
  const progress = gallery.artworks[artworkId];
  if (progress) {
    return progress;
  }

  const artwork = ALL_ARTWORKS.find((a) => a.id === artworkId);
  return {
    threadsContributed: 0,
    sectionsCompleted: 0,
    totalSections: artwork ? artwork.sections.length : 0,
    completed: false,
  };
}

export function getNextIncompleteArtwork(gallery: LoomGalleryState): string | null {
  for (const artwork of ALL_ARTWORKS) {
    const progress = gallery.artworks[artwork.id];
    if (!progress || !progress.completed) {
      return artwork.id;
    }
  }
  return null;
}

export function autoContributeThreads(
  gallery: LoomGalleryState,
  threadsEarned: number
): {
  gallery: LoomGalleryState;
  contributions: Array<{
    artworkId: string;
    threads: number;
    sectionsCompleted: number;
    artworkCompleted: boolean;
  }>;
} {
  let currentGallery = gallery;
  let remainingThreads = threadsEarned;
  const contributions: Array<{
    artworkId: string;
    threads: number;
    sectionsCompleted: number;
    artworkCompleted: boolean;
  }> = [];

  while (remainingThreads > 0) {
    const nextArtworkId = getNextIncompleteArtwork(currentGallery);
    if (!nextArtworkId) {
      break; // All artworks completed
    }

    const artwork = ALL_ARTWORKS.find((a) => a.id === nextArtworkId)!;
    const progress = currentGallery.artworks[nextArtworkId];
    const threadsNeeded = artwork.totalThreadsRequired - (progress?.threadsContributed ?? 0);
    const threadsToContribute = Math.min(remainingThreads, threadsNeeded);

    const result = contributeThreads(currentGallery, nextArtworkId, threadsToContribute);
    currentGallery = result.gallery;
    remainingThreads -= threadsToContribute;

    contributions.push({
      artworkId: nextArtworkId,
      threads: threadsToContribute,
      sectionsCompleted: result.sectionsJustCompleted,
      artworkCompleted: result.artworkJustCompleted,
    });
  }

  return { gallery: currentGallery, contributions };
}
