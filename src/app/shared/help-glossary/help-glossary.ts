import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_ENTRIES,
  GlossaryCategory,
  GlossaryEntry,
} from '../glossary.data';

@Component({
  selector: 'app-help-glossary',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './help-glossary.html',
  styleUrl: './help-glossary.css',
})
export class HelpGlossary {
  open = input<boolean>(false);
  moduleTitle = input<string>('');
  moduleTips = input<string[]>([]);
  initialCategory = input<GlossaryCategory>('all');
  initialTermId = input<string>('');
  closed = output<void>();

  readonly categories = GLOSSARY_CATEGORIES;
  selectedCategory = signal<GlossaryCategory>('all');
  searchQuery = signal<string>('');
  expandedId = signal<string | null>('phishing');
  showHowToPlay = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.open()) {
        this.selectedCategory.set(this.initialCategory());
        if (this.initialTermId()) {
          this.expandedId.set(this.initialTermId());
        } else if (this.initialCategory() !== 'all') {
          const first = GLOSSARY_ENTRIES.find((e) => e.category === this.initialCategory());
          if (first) this.expandedId.set(first.id);
        }
      }
    });
  }

  filteredEntries = computed<GlossaryEntry[]>(() => {
    const cat = this.selectedCategory();
    const q = this.searchQuery().trim().toLowerCase();

    return GLOSSARY_ENTRIES.filter((entry) => {
      const matchesCat = cat === 'all' || entry.category === cat;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        entry.term.toLowerCase().includes(q) ||
        entry.tagline.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q) ||
        entry.categoryLabel.toLowerCase().includes(q) ||
        entry.badExample.toLowerCase().includes(q)
      );
    });
  });

  toggleTerm(id: string) {
    this.expandedId.update((curr) => (curr === id ? null : id));
  }

  selectCategory(cat: GlossaryCategory) {
    this.selectedCategory.set(cat);
  }

  close() {
    this.closed.emit();
  }
}
